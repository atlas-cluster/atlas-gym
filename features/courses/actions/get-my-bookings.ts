'use server'

import { getSession } from '@/features/auth'
import { CourseSessionDisplay } from '@/features/courses/types'
import { pool } from '@/features/shared/lib/db'

export async function getMyBookings(): Promise<CourseSessionDisplay[]> {
  const { member } = await getSession()

  if (!member) {
    return []
  }

  const result = await pool.query(
    `SELECT cb.id as "bookingId",
            cs.id, cs.template_id as "templateId", cs.session_date as "sessionDate",
            cs.start_time as "startTime", cs.end_time as "endTime",
            cs.is_cancelled as "isCancelled",
            cs.created_at as "createdAt", cs.updated_at as "updatedAt",
            ct.name, ct.description,
            m.firstname || ' ' || m.lastname as "trainerName",
            r.name as "roomName", r.capacity as "roomCapacity",
            COUNT(cb_all.id) as "bookedCount"
     FROM course_bookings cb
     JOIN course_sessions cs ON cb.session_id = cs.id
     JOIN course_templates ct ON cs.template_id = ct.id
     JOIN trainers t ON ct.trainer_id = t.member_id
     JOIN members m ON t.member_id = m.id
     JOIN rooms r ON ct.room_id = r.id
     LEFT JOIN course_bookings cb_all ON cs.id = cb_all.session_id
     WHERE cb.member_id = $1
     GROUP BY cb.id, cs.id, cs.template_id, cs.session_date, cs.start_time, cs.end_time,
              cs.is_cancelled, cs.created_at, cs.updated_at,
              ct.name, ct.description, m.firstname, m.lastname,
              r.name, r.capacity
     ORDER BY cs.session_date, cs.start_time`,
    [member.id]
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
