'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'

import { loginSchema } from '@/features/auth/schemas/login'
import { pool } from '@/features/shared/lib/db'

export async function login(data: z.infer<typeof loginSchema>): Promise<{
  success: boolean
  message: string
  errorType?:
    | 'INVALID_CREDENTIALS'
    | 'MEMBER_NOT_FOUND'
    | 'VALIDATION'
    | 'UNKNOWN'
}> {
  try {
    const validated = loginSchema.parse(data)

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const result = await pool.query<{
      found: string
      password_valid: boolean | null
      session_id: string | null
    }>(
      `WITH target_member AS (
        SELECT id, password_hash, firstname, lastname,
               (crypt($2, password_hash) = password_hash) AS password_valid
        FROM members WHERE email = $1
      ),
      new_session AS (
        INSERT INTO sessions (member_id, expires_at)
        SELECT tm.id, $3
        FROM target_member tm
        WHERE tm.password_valid = true
        RETURNING id, member_id
      ),
      log_login AS (
        INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
        SELECT ns.member_id, 'Create'::action_type, ns.id, 'session',
          'Member logged in: ' || tm.firstname || ' ' || tm.lastname
        FROM new_session ns
        JOIN target_member tm ON ns.member_id = tm.id
      )
      SELECT
        (SELECT COUNT(*) FROM target_member) AS found,
        (SELECT password_valid FROM target_member) AS password_valid,
        (SELECT id FROM new_session) AS session_id`,
      [validated.email, validated.password, expiresAt]
    )

    const row = result.rows[0]

    if (parseInt(row.found) === 0) {
      return {
        success: false,
        errorType: 'MEMBER_NOT_FOUND',
        message: 'No account found with this email address.',
      }
    }

    if (!row.password_valid) {
      return {
        success: false,
        errorType: 'INVALID_CREDENTIALS',
        message: 'Invalid password.',
      }
    }

    const cookieStore = await cookies()
    cookieStore.set('session', row.session_id!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    })

    return {
      success: true,
      message: 'Logged in successfully.',
    }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errorType: 'VALIDATION',
        message: 'Invalid input. Please check your data and try again.',
      }
    }
    console.error('[LOGIN_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An unexpected error occurred. Please try again later.',
    }
  }
}
