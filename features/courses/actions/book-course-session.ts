'use server'

import { updateTag } from 'next/cache'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'
import { PG_FOREIGN_KEY_VIOLATION, PG_UNIQUE_VIOLATION } from '@/features/shared/lib/postgres-errors'

export async function bookCourseSession(sessionId: string): Promise<{
  success: boolean
  message: string
  errorType?: 'AUTH' | 'NOT_FOUND' | 'CANCELLED' | 'ALREADY_BOOKED' | 'UNKNOWN'
}> {
  try {
    const { member } = await getSession()

    if (!member) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Unauthorized. Please log in to book a session.',
      }
    }

    // Check session exists and is not cancelled
    const sessionCheck = await pool.query(
      `SELECT id, is_cancelled FROM course_sessions WHERE id = $1`,
      [sessionId]
    )

    if (sessionCheck.rows.length === 0) {
      return { success: false, errorType: 'NOT_FOUND', message: 'Session not found.' }
    }

    if (sessionCheck.rows[0].is_cancelled) {
      return { success: false, errorType: 'CANCELLED', message: 'This session has been cancelled.' }
    }

    await pool.query(
      `INSERT INTO course_bookings (session_id, member_id) VALUES ($1, $2)`,
      [sessionId, member.id]
    )

    updateTag('course-sessions')

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
    if (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === PG_FOREIGN_KEY_VIOLATION
    ) {
      return { success: false, errorType: 'NOT_FOUND', message: 'Session not found.' }
    }
    console.error('[BOOK_COURSE_SESSION_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An unexpected error occurred. Please try again later.',
    }
  }
}
