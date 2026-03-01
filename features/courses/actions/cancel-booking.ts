'use server'

import { updateTag } from 'next/cache'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function cancelBooking(bookingId: string): Promise<{
  success: boolean
  message: string
  errorType?: 'AUTH' | 'NOT_FOUND' | 'UNKNOWN'
}> {
  try {
    const { member } = await getSession()

    if (!member) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Please log in to cancel a booking.',
      }
    }

    const result = await pool.query(
      `WITH target_booking AS (
         SELECT cb.id, cb.member_id,
                COALESCE(cs.name_override, ct.name) AS session_name
         FROM course_bookings cb
           JOIN course_sessions cs ON cs.id = cb.session_id
           JOIN course_templates ct ON ct.id = cs.template_id
         WHERE cb.id = $1
           AND (cb.member_id = $2 OR $3 = true)
       ),
       deleted_booking AS (
         DELETE FROM course_bookings
         WHERE id = $1
           AND EXISTS (SELECT 1 FROM target_booking)
         RETURNING id
       ),
       log_booking AS (
         INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
         SELECT $2, 'Delete'::action_type, db.id, 'course_booking',
           'Cancelled booking for session ' || tb.session_name
         FROM deleted_booking db, target_booking tb
       )
       SELECT
         (SELECT COUNT(*) FROM target_booking) AS found,
         (SELECT id FROM deleted_booking) AS deleted_id`,
      [bookingId, member.id, member.isTrainer ?? false]
    )

    const row = result.rows[0]

    if (parseInt(row.found) === 0) {
      return {
        success: false,
        errorType: 'NOT_FOUND',
        message: 'Booking not found.',
      }
    }

    updateTag('courses')

    return { success: true, message: 'Booking cancelled successfully.' }
  } catch (error: unknown) {
    console.error('[CANCEL_BOOKING_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An unexpected error occurred.',
    }
  }
}
