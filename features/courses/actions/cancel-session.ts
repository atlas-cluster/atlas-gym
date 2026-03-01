'use server'

import { updateTag } from 'next/cache'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function cancelSession(
  sessionId: string,
  lastUpdatedAt: Date
): Promise<{
  success: boolean
  message: string
  errorType?: 'AUTH' | 'NOT_FOUND' | 'VERSION_MISMATCH' | 'UNKNOWN'
}> {
  try {
    const { member } = await getSession()

    if (!member) {
      return { success: false, errorType: 'AUTH', message: 'Unauthorized.' }
    }

    if (!member.isTrainer) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Only trainers can cancel sessions.',
      }
    }

    const result = await pool.query(
      `WITH target_session AS (
         SELECT cs.id,
                COALESCE(cs.name_override, ct.name) AS session_name,
                (date_trunc('milliseconds', cs.updated_at) = $3::timestamptz) AS version_match
         FROM course_sessions cs
           JOIN course_templates ct ON ct.id = cs.template_id
         WHERE cs.id = $1
         FOR UPDATE OF cs
       ),
       updated_session AS (
         UPDATE course_sessions
           SET is_cancelled = true, updated_at = NOW()
           WHERE id = $1
             AND (SELECT version_match FROM target_session) = true
           RETURNING id
       ),
       log_session AS (
         INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
         SELECT $2, 'Update'::action_type, us.id, 'course_session',
           'Session ' || ts.session_name || ' cancelled'
         FROM updated_session us, target_session ts
       )
       SELECT
         (SELECT COUNT(*) FROM target_session) AS found,
         (SELECT version_match FROM target_session) AS version_match,
         (SELECT id FROM updated_session) AS updated_id`,
      [sessionId, member.id, lastUpdatedAt]
    )

    const row = result.rows[0]

    if (parseInt(row.found) === 0) {
      return {
        success: false,
        errorType: 'NOT_FOUND',
        message: 'Session not found.',
      }
    }

    if (!row.version_match) {
      return {
        success: false,
        errorType: 'VERSION_MISMATCH',
        message: 'Session was modified. Please refresh and try again.',
      }
    }

    updateTag('courses')
    updateTag('rooms')

    return { success: true, message: 'Session cancelled successfully.' }
  } catch (error: unknown) {
    console.error('[CANCEL_SESSION_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An unexpected error occurred.',
    }
  }
}
