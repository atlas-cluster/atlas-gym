'use server'

import { cookies } from 'next/headers'

import { pool } from '@/features/shared/lib/db'

export async function logout(): Promise<{
  success: boolean
  message: string
  errorType?: 'AUTH' | 'UNKNOWN'
}> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value

    if (!sessionId) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'No active session found.',
      }
    }

    await pool.query(
      `WITH deleted_session AS (
        DELETE FROM sessions WHERE id = $1
        RETURNING member_id
      ),
      log_logout AS (
        INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
        SELECT ds.member_id, 'Delete'::action_type, $1, 'session', 'Member logged out'
        FROM deleted_session ds
      )
      SELECT member_id FROM deleted_session`,
      [sessionId]
    )

    cookieStore.delete('session')

    return {
      success: true,
      message: 'Logged out successfully.',
    }
  } catch (error: unknown) {
    console.error('[LOGOUT_ERROR]:', error)

    const cookieStore = await cookies()
    cookieStore.delete('session')

    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An error occurred during logout.',
    }
  }
}
