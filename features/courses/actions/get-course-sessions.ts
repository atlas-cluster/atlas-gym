'use server'

import { getSession } from '@/features/auth'
import { CourseSessionDisplay } from '@/features/courses/types'
import { pool } from '@/features/shared/lib/db'

export async function getCourseSessions(
  startDate?: string,
  endDate?: string
): Promise<CourseSessionDisplay[]> {
  const { member } = await getSession()

  if (!member) {
    return []
  }

  const result = await pool.query(
    `SELECT cs.id, cs.template_id as "templateId", cs.session_date as "sessionDate",
            cs.start_time as "startTime", cs.end_time as "endTime",
            cs.is_cancelled as "isCancelled",
            cs.created_at as "createdAt", cs.updated_at as "updatedAt",
            ct.name, ct.description,
            m.firstname || ' ' || m.lastname as "trainerName",
            r.name as "roomName", r.capacity as "roomCapacity",
            cb_me.id as "bookingId",
            COUNT(cb_all.id) as "bookedCount"
     FROM course_sessions cs
     JOIN course_templates ct ON cs.template_id = ct.id
     JOIN trainers t ON ct.trainer_id = t.member_id
     JOIN members m ON t.member_id = m.id
     JOIN rooms r ON ct.room_id = r.id
     LEFT JOIN course_bookings cb_me ON cs.id = cb_me.session_id AND cb_me.member_id = $1
     LEFT JOIN course_bookings cb_all ON cs.id = cb_all.session_id
     WHERE cs.session_date >= $2::date
       AND cs.session_date <= $3::date
     GROUP BY cs.id, cs.template_id, cs.session_date, cs.start_time, cs.end_time,
              cs.is_cancelled, cs.created_at, cs.updated_at,
              ct.name, ct.description, m.firstname, m.lastname,
              r.name, r.capacity, cb_me.id
     ORDER BY cs.session_date, cs.start_time`,
    [
      member.id,
      startDate ?? new Date().toISOString().split('T')[0],
      endDate ??
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
    ]
  )

  return result.rows.map((row) => ({
    ...row,
    sessionDate: new Date(row.sessionDate),
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
    roomCapacity: parseInt(row.roomCapacity, 10),
    bookedCount: parseInt(row.bookedCount, 10),
    bookingId: row.bookingId ?? undefined,
    description: row.description ?? undefined,
  }))
}
