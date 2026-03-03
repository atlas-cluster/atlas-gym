'use server'

import { getSession } from '@/features/auth'
import { CourseSessionDisplay } from '@/features/courses/types'
import { pool } from '@/features/shared/lib/db'

export async function getMyCourseSessions(
  date?: string
): Promise<CourseSessionDisplay[]> {
  const { member } = await getSession()

  if (!member || !member.isTrainer) {
    return []
  }

  const effectiveDate = date ?? new Date().toISOString().split('T')[0]

  const result = await pool.query(
    `SELECT
       cs.id,
       cs.template_id                                              AS "templateId",
       cs.session_date::text                                       AS "sessionDate",
       COALESCE(cs.name_override, ct.name)                         AS "name",
       COALESCE(cs.description_override, ct.description)           AS "description",
       ct.banner_image_url                                         AS "bannerImageUrl",
       cs.session_date + COALESCE(cs.start_time_override, cs.start_time) AS "startTime",
       cs.session_date + COALESCE(cs.end_time_override, cs.end_time)     AS "endTime",
       COALESCE(cs.start_time_override, cs.start_time)::text       AS "startTimeRaw",
       COALESCE(cs.end_time_override, cs.end_time)::text           AS "endTimeRaw",
       cs.is_cancelled                                             AS "isCancelled",
       COALESCE(cs.trainer_id_override, ct.trainer_id)             AS "trainerId",
       COALESCE(
         m_override.firstname || ' ' || m_override.lastname,
         m.firstname || ' ' || m.lastname
       )                                                           AS "trainerName",
       COALESCE(cs.room_id_override, ct.room_id)                  AS "roomId",
       COALESCE(r_override.name, r.name)                           AS "roomName",
       cs.updated_at                                               AS "updatedAt",
       (cs.name_override IS NOT NULL
         OR cs.description_override IS NOT NULL
         OR cs.trainer_id_override IS NOT NULL
         OR cs.room_id_override IS NOT NULL
         OR cs.start_time_override IS NOT NULL
         OR cs.end_time_override IS NOT NULL)                      AS "hasOverrides",
       ct.name                                                     AS "originalName",
       ct.description                                              AS "originalDescription",
       ct.trainer_id                                               AS "originalTrainerId",
       m.firstname || ' ' || m.lastname                            AS "originalTrainerName",
       ct.room_id                                                  AS "originalRoomId",
       r.name                                                      AS "originalRoomName",
       cs.start_time::text                                         AS "originalStartTime",
       cs.end_time::text                                           AS "originalEndTime",
       COALESCE(bc.booking_count, 0)::int                          AS "bookingCount",
       my_booking.id                                               AS "myBookingId"
     FROM course_sessions cs
       JOIN course_templates ct ON ct.id = cs.template_id
       LEFT JOIN members m ON ct.trainer_id = m.id
       LEFT JOIN members m_override ON cs.trainer_id_override = m_override.id
       LEFT JOIN rooms r ON ct.room_id = r.id
       LEFT JOIN rooms r_override ON cs.room_id_override = r_override.id
       LEFT JOIN LATERAL (
         SELECT COUNT(*) AS booking_count
         FROM course_bookings cb
         WHERE cb.session_id = cs.id
       ) bc ON true
       LEFT JOIN course_bookings my_booking
         ON my_booking.session_id = cs.id AND my_booking.member_id = $2
     WHERE cs.session_date = $1::date
       AND COALESCE(cs.trainer_id_override, ct.trainer_id) = $2
     ORDER BY COALESCE(cs.start_time_override, cs.start_time), ct.name`,
    [effectiveDate, member.id]
  )

  return result.rows.map((row) => ({
    ...row,
    startTime: new Date(row.startTime),
    endTime: new Date(row.endTime),
    trainerId: row.trainerId ?? undefined,
    trainerName: row.trainerName ?? undefined,
    roomId: row.roomId ?? undefined,
    roomName: row.roomName ?? undefined,
    description: row.description ?? undefined,
    bannerImageUrl: row.bannerImageUrl ?? undefined,
    isBookedByMe: !!row.myBookingId,
    myBookingId: row.myBookingId ?? undefined,
    updatedAt: new Date(row.updatedAt),
    originalName: row.originalName,
    originalDescription: row.originalDescription ?? undefined,
    originalTrainerId: row.originalTrainerId ?? undefined,
    originalTrainerName: row.originalTrainerName ?? undefined,
    originalRoomId: row.originalRoomId ?? undefined,
    originalRoomName: row.originalRoomName ?? undefined,
    originalStartTime: row.originalStartTime,
    originalEndTime: row.originalEndTime,
  }))
}
