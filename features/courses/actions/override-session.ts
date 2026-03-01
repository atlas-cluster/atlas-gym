'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

import { getSession } from '@/features/auth'
import { sessionOverrideSchema } from '@/features/courses/schemas/session-override'
import { pool } from '@/features/shared/lib/db'

export async function overrideSession(
  sessionId: string,
  data: z.infer<typeof sessionOverrideSchema>,
  lastUpdatedAt: Date
): Promise<{
  success: boolean
  message: string
  errorType?:
    | 'AUTH'
    | 'NOT_FOUND'
    | 'VERSION_MISMATCH'
    | 'VALIDATION'
    | 'UNKNOWN'
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
        message: 'Only trainers can override sessions.',
      }
    }

    const validated = sessionOverrideSchema.parse(data)

    const nameOverride = validated.nameOverride || null
    const descriptionOverride = validated.descriptionOverride || null
    const trainerIdOverride = validated.trainerIdOverride || null
    const roomIdOverride = validated.roomIdOverride || null
    const startTimeOverride = validated.startTimeOverride || null
    const endTimeOverride = validated.endTimeOverride || null

    const result = await pool.query(
      `WITH target_session AS (
         SELECT cs.id,
                COALESCE(cs.name_override, ct.name) AS session_name,
                (date_trunc('milliseconds', cs.updated_at) = $8::timestamptz) AS version_match
         FROM course_sessions cs
           JOIN course_templates ct ON ct.id = cs.template_id
         WHERE cs.id = $1
         FOR UPDATE OF cs
       ),
       updated_session AS (
         UPDATE course_sessions
           SET name_override = $2,
               description_override = $3,
               trainer_id_override = $4,
               room_id_override = $5,
               start_time_override = $6::time,
               end_time_override = $7::time,
               updated_at = NOW()
           WHERE id = $1
             AND (SELECT version_match FROM target_session) = true
           RETURNING id
       ),
       log_session AS (
         INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
         SELECT $9, 'Update'::action_type, us.id, 'course_session',
           'Session ' || ts.session_name || ' overridden'
         FROM updated_session us, target_session ts
       )
       SELECT
         (SELECT COUNT(*) FROM target_session) AS found,
         (SELECT version_match FROM target_session) AS version_match,
         (SELECT id FROM updated_session) AS updated_id`,
      [
        sessionId,
        nameOverride,
        descriptionOverride,
        trainerIdOverride,
        roomIdOverride,
        startTimeOverride,
        endTimeOverride,
        lastUpdatedAt,
        member.id,
      ]
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
        message:
          'Session was modified by another user. Please refresh and try again.',
      }
    }

    updateTag('courses')
    updateTag('rooms')

    return { success: true, message: 'Session updated successfully.' }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errorType: 'VALIDATION',
        message: 'Invalid input data.',
      }
    }
    console.error('[OVERRIDE_SESSION_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An unexpected error occurred.',
    }
  }
}
