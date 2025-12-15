import bcrypt from 'bcryptjs'
import { getPool } from './db'
import { User, Session } from './schemas'

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

export async function createUser(data: {
  email: string
  password: string
  firstname: string
  lastname: string
  middlename?: string
  birthdate: string
  address?: string
  phone?: string
  paymentType?: string
  paymentInfo?: string
}): Promise<User | null> {
  const pool = getPool()
  const passwordHash = await hashPassword(data.password)

  try {
    const result = await pool.query(
      `INSERT INTO gym_manager.users 
        (user_email, password_hash, user_firstname, user_lastname, user_middlename, 
         user_birthdate, user_address, user_phone, payment_type, payment_info)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, created_at, user_firstname, user_lastname, user_middlename, 
                 user_email, user_address, user_birthdate, user_phone, payment_type, payment_info`,
      [
        data.email,
        passwordHash,
        data.firstname,
        data.lastname,
        data.middlename || null,
        data.birthdate,
        data.address || null,
        data.phone || null,
        data.paymentType || null,
        data.paymentInfo || null,
      ]
    )

    return result.rows[0] as User
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const pool = getPool()

  try {
    const result = await pool.query(
      `SELECT id, created_at, user_firstname, user_lastname, user_middlename, 
              user_email, user_address, user_birthdate, user_phone, payment_type, payment_info
       FROM gym_manager.users 
       WHERE user_email = $1`,
      [email]
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0] as User
  } catch (error) {
    console.error('Error getting user by email:', error)
    return null
  }
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<User | null> {
  const pool = getPool()

  try {
    const result = await pool.query(
      `SELECT id, created_at, user_firstname, user_lastname, user_middlename, 
              user_email, user_address, user_birthdate, user_phone, payment_type, payment_info,
              password_hash
       FROM gym_manager.users 
       WHERE user_email = $1`,
      [email]
    )

    if (result.rows.length === 0) {
      return null
    }

    const user = result.rows[0]
    const isValid = await verifyPassword(password, user.password_hash)

    if (!isValid) {
      return null
    }

    // Remove password_hash from returned user object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user
    return userWithoutPassword as User
  } catch (error) {
    console.error('Error authenticating user:', error)
    return null
  }
}

export async function createSession(userId: string): Promise<Session | null> {
  const pool = getPool()
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  try {
    const result = await pool.query(
      `INSERT INTO gym_manager.sessions (user_id, expires_at)
       VALUES ($1, $2)
       RETURNING id, user_id, expires_at, created_at`,
      [userId, expiresAt]
    )

    return result.rows[0] as Session
  } catch (error) {
    console.error('Error creating session:', error)
    return null
  }
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const pool = getPool()

  try {
    const result = await pool.query(
      `SELECT id, user_id, expires_at, created_at
       FROM gym_manager.sessions 
       WHERE id = $1 AND expires_at > NOW()`,
      [sessionId]
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0] as Session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  const pool = getPool()

  try {
    await pool.query(`DELETE FROM gym_manager.sessions WHERE id = $1`, [
      sessionId,
    ])
    return true
  } catch (error) {
    console.error('Error deleting session:', error)
    return false
  }
}

export async function getUserBySessionId(
  sessionId: string
): Promise<User | null> {
  const pool = getPool()

  try {
    const result = await pool.query(
      `SELECT u.id, u.created_at, u.user_firstname, u.user_lastname, u.user_middlename,
              u.user_email, u.user_address, u.user_birthdate, u.user_phone, u.payment_type, u.payment_info
       FROM gym_manager.users u
       JOIN gym_manager.sessions s ON u.id = s.user_id
       WHERE s.id = $1 AND s.expires_at > NOW()`,
      [sessionId]
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0] as User
  } catch (error) {
    console.error('Error getting user by session:', error)
    return null
  }
}
