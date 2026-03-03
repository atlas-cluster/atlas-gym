'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

import { getSession } from '@/features/auth'
import { sessionOverrideSchema } from '@/features/courses/schemas/session-override'
import { pool } from '@/features/shared/lib/db'
import { PG_EXCLUSION_VIOLATION } from '@/features/shared/lib/postgres-errors'

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
    | 'SCHEDULE_CONFLICT'
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

    // Fetch original template values and session base times to compare
    const origResult = await pool.query(
      `SELECT ct.name, ct.description, ct.trainer_id, ct.room_id,
              cs.start_time::text AS start_time, cs.end_time::text AS end_time
       FROM course_sessions cs
         JOIN course_templates ct ON ct.id = cs.template_id
       WHERE cs.id = $1`,
      [sessionId]
    )

    if (origResult.rows.length === 0) {
      return {
        success: false,
        errorType: 'NOT_FOUND',
        message: 'Session not found.',
      }
    }

    const orig = origResult.rows[0]

    // Set override to null when the value matches the original (no override needed)
    const nameOverride =
      validated.nameOverride && validated.nameOverride !== orig.name
        ? validated.nameOverride
        : null
    const descriptionOverride =
      validated.descriptionOverride &&
      validated.descriptionOverride !== (orig.description ?? '')
        ? validated.descriptionOverride
        : null
    const trainerIdOverride =
      validated.trainerIdOverride &&
      validated.trainerIdOverride !== (orig.trainer_id ?? '')
        ? validated.trainerIdOverride
        : null
    const roomIdOverride =
      validated.roomIdOverride &&
      validated.roomIdOverride !== (orig.room_id ?? '')
        ? validated.roomIdOverride
        : null
    const startTimeOverride =
      validated.startTimeOverride &&
      validated.startTimeOverride !== orig.start_time.slice(0, 5)
        ? validated.startTimeOverride
        : null
    const endTimeOverride =
      validated.endTimeOverride &&
      validated.endTimeOverride !== orig.end_time.slice(0, 5)
        ? validated.endTimeOverride
        : null

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
    if (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === PG_EXCLUSION_VIOLATION
    ) {
      const constraint =
        'constraint' in error ? (error.constraint as string) : ''
      if (constraint === 'prevent_session_trainer_overlap') {
        return {
          success: false,
          errorType: 'SCHEDULE_CONFLICT',
          message:
            'The trainer already has another session at this time on this date.',
        }
      }
      if (constraint === 'prevent_session_room_overlap') {
        return {
          success: false,
          errorType: 'SCHEDULE_CONFLICT',
          message:
            'The room already has another session at this time on this date.',
        }
      }
      return {
        success: false,
        errorType: 'SCHEDULE_CONFLICT',
        message:
          'This session conflicts with an existing schedule. Please choose a different time or room.',
      }
    }
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
