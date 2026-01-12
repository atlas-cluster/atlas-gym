'use server'

import { Session, User, UserData } from '@/app/auth/model'
import { getPool } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { getSecureCookieOptions } from '@/lib/config'
import { loginSchema, registrationSchema } from '@/lib/schemas'
import { z } from 'zod'

const SALT_ROUNDS = 10
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

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
  const sql = getPool()
  const passwordHash = await hashPassword(data.password)

  try {
    // Use transaction with postgres
    const user = await sql.begin(async (sql) => {
      // Insert user
      const userResult = await sql`
        INSERT INTO gym_manager.users 
          (user_email, password_hash, user_firstname, user_lastname, user_middlename, 
           user_birthdate, user_address, user_phone)
         VALUES (${data.email}, ${passwordHash}, ${data.firstname}, ${data.lastname}, 
                 ${data.middlename || null}, ${data.birthdate}, ${data.address}, ${data.phone})
         RETURNING id, created_at, user_firstname, user_lastname, user_middlename, 
                   user_email, user_address, user_birthdate, user_phone
      `

      const insertedUser = userResult[0] as User

      // Insert payment method
      if (
        data.paymentType === 'credit_card' &&
        'cardNumber' in data.paymentInfo
      ) {
        // Store full card number
        const cardNumber = data.paymentInfo.cardNumber.replace(/\s/g, '')

        await sql`
          INSERT INTO gym_manager.payment_methods 
            (user_id, payment_type, card_number, card_expiry)
           VALUES (${insertedUser.id}, ${data.paymentType}, ${cardNumber}, ${data.paymentInfo.cardExpiry})
        `
      } else if (data.paymentType === 'iban' && 'iban' in data.paymentInfo) {
        await sql`
          INSERT INTO gym_manager.payment_methods 
            (user_id, payment_type, iban)
           VALUES (${insertedUser.id}, ${data.paymentType}, ${data.paymentInfo.iban})
        `
      }

      return insertedUser
    })

    return user
  } catch (error) {
    console.error('Error creating user:', error)
    // Re-throw the error so the caller can handle it appropriately
    throw error
  }
}

export async function checkEmailExists(email: string): Promise<boolean> {
  const sql = getPool()
  const result = await sql`
      SELECT id FROM gym_manager.users WHERE user_email = ${email}
    `

  return result.length > 0
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthResult> {
  const sql = getPool()

  try {
    const result = await sql`
      SELECT u.id, u.created_at, u.user_firstname, u.user_lastname, u.user_middlename,
              u.user_email, u.user_address, u.user_birthdate, u.user_phone,
              u.password_hash,
              CASE WHEN t.id IS NOT NULL THEN true ELSE false END as "isTrainer"
       FROM gym_manager.users u
       LEFT JOIN gym_manager.trainers t ON u.id = t.user_id
       WHERE u.user_email = ${email}
    `

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
    return { user: userWithoutPassword as User }
  } catch (error) {
    console.error('Error authenticating user:', error)
    return { user: null, error: 'DB_ERROR' }
  }
}

export async function getCurrentUser(): Promise<UserData | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session')?.value

  if (!sessionId) {
    return null
  }

  const user = await getUserBySessionId(sessionId)

  if (!user) {
    // Session is invalid or expired, clear the cookie
    cookieStore.delete('session')
    return null
  }

  // Return only serializable data
  return {
    id: user.id,
    email: user.user_email,
    firstname: user.user_firstname,
    lastname: user.user_lastname,
    middlename: user.user_middlename,
    birthdate: user.user_birthdate.toISOString(),
    address: user.user_address,
    phone: user.user_phone,
    isTrainer: user.isTrainer,
  }
}

export async function logoutUser(): Promise<void> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session')?.value

  if (sessionId) {
    await deleteSession(sessionId)
  }

  cookieStore.delete('session')
}

export async function login(data: z.infer<typeof loginSchema>) {
  const result = loginSchema.safeParse(data)

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const { email, password } = result.data
  const authResponse = await authenticateUser(email, password)

  if (!authResponse.user) {
    if (authResponse.error === 'NOT_FOUND') {
      return { success: false, error: 'User does not exist', field: 'email' }
    }
    if (authResponse.error === 'INVALID_PASSWORD') {
      return { success: false, error: 'Incorrect password', field: 'password' }
    }
    return { success: false, error: 'Authentication error' }
  }

  const session = await createSession(authResponse.user.id)
  if (!session) {
    return { success: false, error: 'Failed to create session' }
  }

  const cookieStore = await cookies()
  cookieStore.set('session', session.id, getSecureCookieOptions())

  return { success: true }
}

export async function register(data: z.infer<typeof registrationSchema>) {
  const result = registrationSchema.safeParse(data)

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  try {
    const user = await createUser(result.data)
    const session = await createSession(user.id)

    if (!session) {
      return { success: false, error: 'Failed to create session' }
    }

    const cookieStore = await cookies()
    cookieStore.set('session', session.id, getSecureCookieOptions())

    return { success: true }
  } catch (error: unknown) {
    // Type assertion for Postgres error
    const pgError = error as { code?: string; constraint?: string }

    // Postgres unique violation
    if (
      pgError.code === '23505' &&
      pgError.constraint === 'users_user_email_key'
    ) {
      return {
        success: false,
        error: 'This email is already registered',
        field: 'email',
      }
    }

    console.error('Registration error:', error)
    return {
      success: false,
      error: 'Failed to create user. Please check your information.',
    }
  }
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export async function createSession(userId: string): Promise<Session | null> {
  const sql = getPool()
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  try {
    const result = await sql`
      INSERT INTO gym_manager.sessions (user_id, expires_at)
       VALUES (${userId}, ${expiresAt})
       RETURNING id, user_id, expires_at, created_at
    `

    return result[0] as Session
  } catch (error) {
    console.error('Error creating session:', error)
    return null
  }
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const sql = getPool()

  try {
    const result = await sql`
      SELECT id, user_id, expires_at, created_at
       FROM gym_manager.sessions 
       WHERE id = ${sessionId} AND expires_at > NOW()
    `

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
  const sql = getPool()

  try {
    await sql`DELETE FROM gym_manager.sessions WHERE id = ${sessionId}`
    return true
  } catch (error) {
    console.error('Error deleting session:', error)
    return false
  }
}

export async function getUserBySessionId(
  sessionId: string
): Promise<User | null> {
  const sql = getPool()

  try {
    const result = await sql`
      SELECT u.id, u.created_at, u.user_firstname, u.user_lastname, u.user_middlename,
              u.user_email, u.user_address, u.user_birthdate, u.user_phone,
              CASE WHEN t.id IS NOT NULL THEN true ELSE false END as "isTrainer"
       FROM gym_manager.users u
       JOIN gym_manager.sessions s ON u.id = s.user_id
       LEFT JOIN gym_manager.trainers t ON u.id = t.user_id
       WHERE s.id = ${sessionId} AND s.expires_at > NOW()
    `

    if (result.length === 0) {
      return null
    }

    return result[0] as User
  } catch (error) {
    console.error('Error getting user by session:', error)
    return null
  }
}
