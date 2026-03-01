'use server'

import { updateTag } from 'next/cache'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'
import { PG_UNIQUE_VIOLATION } from '@/features/shared/lib/postgres-errors'

export async function createBooking(sessionId: string): Promise<{
  success: boolean
  message: string
  errorType?: 'AUTH' | 'CANCELLED' | 'ALREADY_BOOKED' | 'NOT_FOUND' | 'UNKNOWN'
}> {
  try {
    const { member } = await getSession()

    if (!member) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Please log in to book a session.',
      }
    }

    const result = await pool.query(
      `WITH target_session AS (
         SELECT cs.id, cs.is_cancelled,
                COALESCE(cs.name_override, ct.name) AS session_name
         FROM course_sessions cs
           JOIN course_templates ct ON ct.id = cs.template_id
         WHERE cs.id = $1
       ),
       inserted_booking AS (
         INSERT INTO course_bookings (session_id, member_id)
         SELECT $1, $2
         FROM target_session
         WHERE is_cancelled = false
         RETURNING id
       ),
       log_booking AS (
         INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
         SELECT $2, 'Create'::action_type, ib.id, 'course_booking',
           'Booked session ' || ts.session_name
         FROM inserted_booking ib, target_session ts
       )
       SELECT
         (SELECT COUNT(*) FROM target_session) AS found,
         (SELECT is_cancelled FROM target_session) AS is_cancelled,
         (SELECT id FROM inserted_booking) AS booking_id`,
      [sessionId, member.id]
    )

    const row = result.rows[0]

    if (parseInt(row.found) === 0) {
      return {
        success: false,
        errorType: 'NOT_FOUND',
        message: 'Session not found.',
      }
    }

    if (row.is_cancelled) {
      return {
        success: false,
        errorType: 'CANCELLED',
        message: 'Cannot book a cancelled session.',
      }
    }

    updateTag('courses')

    return { success: true, message: 'Session booked successfully.' }
  } catch (error: unknown) {
    if (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === PG_UNIQUE_VIOLATION
    ) {
      return {
        success: false,
        errorType: 'ALREADY_BOOKED',
        message: 'You have already booked this session.',
      }
    }
    console.error('[CREATE_BOOKING_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An unexpected error occurred.',
    }
  }
}
