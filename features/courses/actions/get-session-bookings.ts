'use server'

import { getSession } from '@/features/auth'
import { SessionBookingMember } from '@/features/courses/types'
import { pool } from '@/features/shared/lib/db'

export async function getSessionBookings(
  sessionId: string
): Promise<SessionBookingMember[]> {
  const { member } = await getSession()

  if (!member || !member.isTrainer) {
    return []
  }

  const result = await pool.query(
    `SELECT
       m.id,
       m.firstname AS "firstname",
       m.lastname  AS "lastname",
       m.email,
       cb.created_at AS "bookedAt"
     FROM course_bookings cb
       JOIN members m ON cb.member_id = m.id
     WHERE cb.session_id = $1
     ORDER BY cb.created_at`,
    [sessionId]
  )

  return result.rows.map((row) => ({
    ...row,
    bookedAt: new Date(row.bookedAt),
  }))
}
