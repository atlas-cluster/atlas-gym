import bcrypt from 'bcryptjs'
import { db } from './db'
import { users, paymentMethods, sessions } from './db/schema'
import { eq, and, gt } from 'drizzle-orm'
import type { User, Session } from './schemas'

const SALT_ROUNDS = 10
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export type AuthResult =
  | { user: User; error?: undefined }
  | { user: null; error: 'NOT_FOUND' | 'INVALID_PASSWORD' | 'DB_ERROR' }

export async function createUser(data: {
  email: string
  password: string
  firstname: string
  lastname: string
  middlename?: string
  birthdate: string
  address: string
  phone: string
  paymentType: 'credit_card' | 'iban'
  paymentInfo:
    | { cardNumber: string; cardExpiry: string; cardCVC: string }
    | { iban: string }
}): Promise<User> {
  const passwordHash = await hashPassword(data.password)

  try {
    // Use transaction with Drizzle
    const user = await db.transaction(async (tx) => {
      // Insert user
      const [insertedUser] = await tx
        .insert(users)
        .values({
          userEmail: data.email,
          passwordHash: passwordHash,
          userFirstname: data.firstname,
          userLastname: data.lastname,
          userMiddlename: data.middlename || null,
          userBirthdate: data.birthdate,
          userAddress: data.address,
          userPhone: data.phone,
        })
        .returning({
          id: users.id,
          created_at: users.createdAt,
          user_firstname: users.userFirstname,
          user_lastname: users.userLastname,
          user_middlename: users.userMiddlename,
          user_email: users.userEmail,
          user_address: users.userAddress,
          user_birthdate: users.userBirthdate,
          user_phone: users.userPhone,
        })

      // Insert payment method
      if (
        data.paymentType === 'credit_card' &&
        'cardNumber' in data.paymentInfo
      ) {
        // Store full card number
        const cardNumber = data.paymentInfo.cardNumber.replace(/\s/g, '')

        await tx.insert(paymentMethods).values({
          userId: insertedUser.id,
          paymentType: data.paymentType,
          cardNumber: cardNumber,
          cardExpiry: data.paymentInfo.cardExpiry,
        })
      } else if (data.paymentType === 'iban' && 'iban' in data.paymentInfo) {
        await tx.insert(paymentMethods).values({
          userId: insertedUser.id,
          paymentType: data.paymentType,
          iban: data.paymentInfo.iban,
        })
      }

      // Convert to User type (Drizzle date returns string, need to convert to Date)
      return {
        ...insertedUser,
        user_birthdate: new Date(insertedUser.user_birthdate),
      } as User
    })

    return user
  } catch (error) {
    console.error('Error creating user:', error)
    // Re-throw the error so the caller can handle it appropriately
    throw error
  }
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const result = await db
      .select({
        id: users.id,
        created_at: users.createdAt,
        user_firstname: users.userFirstname,
        user_lastname: users.userLastname,
        user_middlename: users.userMiddlename,
        user_email: users.userEmail,
        user_address: users.userAddress,
        user_birthdate: users.userBirthdate,
        user_phone: users.userPhone,
        password_hash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.userEmail, email))

    if (result.length === 0) {
      return { user: null, error: 'NOT_FOUND' }
    }

    const user = result[0]
    const isValid = await verifyPassword(password, user.password_hash)

    if (!isValid) {
      return { user: null, error: 'INVALID_PASSWORD' }
    }

    // Remove password_hash from returned user object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user
    return {
      user: {
        ...userWithoutPassword,
        user_birthdate: new Date(userWithoutPassword.user_birthdate),
      } as User,
    }
  } catch (error) {
    console.error('Error authenticating user:', error)
    return { user: null, error: 'DB_ERROR' }
  }
}

export async function createSession(userId: string): Promise<Session | null> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  try {
    const [session] = await db
      .insert(sessions)
      .values({
        userId: userId,
        expiresAt: expiresAt,
      })
      .returning({
        id: sessions.id,
        user_id: sessions.userId,
        expires_at: sessions.expiresAt,
        created_at: sessions.createdAt,
      })

    return session as Session
  } catch (error) {
    console.error('Error creating session:', error)
    return null
  }
}

export async function getSession(sessionId: string): Promise<Session | null> {
  try {
    const result = await db
      .select({
        id: sessions.id,
        user_id: sessions.userId,
        expires_at: sessions.expiresAt,
        created_at: sessions.createdAt,
      })
      .from(sessions)
      .where(
        and(
          eq(sessions.id, sessionId),
          gt(sessions.expiresAt, new Date())
        )
      )

    if (result.length === 0) {
      return null
    }

    return result[0] as Session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  try {
    await db.delete(sessions).where(eq(sessions.id, sessionId))
    return true
  } catch (error) {
    console.error('Error deleting session:', error)
    return false
  }
}

export async function getUserBySessionId(
  sessionId: string
): Promise<User | null> {
  try {
    const result = await db
      .select({
        id: users.id,
        created_at: users.createdAt,
        user_firstname: users.userFirstname,
        user_lastname: users.userLastname,
        user_middlename: users.userMiddlename,
        user_email: users.userEmail,
        user_address: users.userAddress,
        user_birthdate: users.userBirthdate,
        user_phone: users.userPhone,
      })
      .from(users)
      .innerJoin(sessions, eq(users.id, sessions.userId))
      .where(
        and(
          eq(sessions.id, sessionId),
          gt(sessions.expiresAt, new Date())
        )
      )

    if (result.length === 0) {
      return null
    }

    return {
      ...result[0],
      user_birthdate: new Date(result[0].user_birthdate),
    } as User
  } catch (error) {
    console.error('Error getting user by session:', error)
    return null
  }
}
