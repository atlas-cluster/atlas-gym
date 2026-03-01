'use server'

import { getSession } from '@/features/auth'
import { CourseBookingDisplay } from '@/features/courses/types'
import { pool } from '@/features/shared/lib/db'

export async function getMyBookings(
  date?: string
): Promise<CourseBookingDisplay[]> {
  const { member } = await getSession()

  if (!member) {
    return []
  }

  const dateFilter = date
    ? 'AND cs.session_date = $2::date'
    : 'AND cs.session_date >= CURRENT_DATE'

  const result = await pool.query(
    `SELECT
       cb.id,
       cb.session_id                                                AS "sessionId",
       cs.session_date::text                                        AS "sessionDate",
       COALESCE(cs.name_override, ct.name)                          AS "name",
       COALESCE(cs.description_override, ct.description)            AS "description",
       COALESCE(cs.start_time_override, cs.start_time)::text        AS "startTime",
       COALESCE(cs.end_time_override, cs.end_time)::text            AS "endTime",
       COALESCE(
         m_override.firstname || ' ' || m_override.lastname,
         m.firstname || ' ' || m.lastname
       )                                                            AS "trainerName",
       COALESCE(r_override.name, r.name)                            AS "roomName",
       cs.is_cancelled                                              AS "isCancelled",
       cb.created_at                                                AS "createdAt"
     FROM course_bookings cb
       JOIN course_sessions cs ON cs.id = cb.session_id
       JOIN course_templates ct ON ct.id = cs.template_id
       LEFT JOIN members m ON ct.trainer_id = m.id
       LEFT JOIN members m_override ON cs.trainer_id_override = m_override.id
       LEFT JOIN rooms r ON ct.room_id = r.id
       LEFT JOIN rooms r_override ON cs.room_id_override = r_override.id
     WHERE cb.member_id = $1
       ${dateFilter}
     ORDER BY cs.session_date, COALESCE(cs.start_time_override, cs.start_time)`,
    date ? [member.id, date] : [member.id]
  )

  return result.rows.map((row) => ({
    ...row,
    trainerName: row.trainerName ?? undefined,
    roomName: row.roomName ?? undefined,
    description: row.description ?? undefined,
    createdAt: new Date(row.createdAt),
  }))
}
