'use server'

import { updateTag } from 'next/cache'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function cancelCourseBooking(bookingId: string): Promise<{
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
        message: 'Unauthorized. Please log in to cancel a booking.',
      }
    }

    const result = await pool.query(
      `DELETE FROM course_bookings WHERE id = $1 AND member_id = $2 RETURNING id`,
      [bookingId, member.id]
    )

    if (result.rowCount === 0) {
      return {
        success: false,
        errorType: 'NOT_FOUND',
        message: 'Booking not found or you do not have permission to cancel it.',
      }
    }

    updateTag('course-sessions')

    return { success: true, message: 'Booking cancelled successfully.' }
  } catch (error: unknown) {
    console.error('[CANCEL_COURSE_BOOKING_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An unexpected error occurred. Please try again later.',
    }
  }
}
