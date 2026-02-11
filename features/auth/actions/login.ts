'use server'

import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

import { loginSchema } from '@/features/auth/schemas/login'
import { LoginError } from '@/features/auth/types'
import { pool } from '@/features/shared/lib/db'

export async function login(
  data: z.infer<typeof loginSchema>
): Promise<{ error: LoginError } | void> {
  const validation = loginSchema.safeParse(data)

  if (!validation.success) {
    return { error: 'INVALID_INPUT' }
  }

  const { email, password } = validation.data

  try {
    // 1. Find member
    const result = await pool.query(
      `SELECT id, password_hash FROM gym_manager.members WHERE email = $1`,
      [email]
    )

    if (result.rows.length === 0) {
      return { error: 'MEMBER_NOT_FOUND' }
    }

    const member = result.rows[0]

    // 2. Verify password
    const validPassword = await bcrypt.compare(password, member.password_hash)
    if (!validPassword) {
      return { error: 'INVALID_CREDENTIALS' }
    }

    // 3. Create session (valid for 7 days)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const sessionResult = await pool.query<{ id: string }>(
      `INSERT INTO gym_manager.sessions (member_id, expires_at) 
       VALUES ($1, $2) 
       RETURNING id`,
      [member.id, expiresAt]
    )

    const sessionId = sessionResult.rows[0].id

    // 4. Set cookie
    const cookieStore = await cookies()
    cookieStore.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    })
  } catch (error) {
    console.error('Login error:', error)
    return { error: 'UNKNOWN_ERROR' }
  }
}
