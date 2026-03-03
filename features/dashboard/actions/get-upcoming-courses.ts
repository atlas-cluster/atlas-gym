'use server'

import { unstable_cache } from 'next/cache'

import { getSession } from '@/features/auth'
import type { DashboardUpcomingCourse } from '@/features/dashboard/types'
import { pool } from '@/features/shared/lib/db'

export type UpcomingRange = 'today' | '7days' | '30days'

const RANGE_INTERVALS: Record<UpcomingRange, string> = {
  today: '0 days',
  '7days': '7 days',
  '30days': '30 days',
}

const getUpcomingCoursesCached = unstable_cache(
  async (
    memberId: string,
    isTrainer: boolean,
    range: UpcomingRange
  ): Promise<DashboardUpcomingCourse[]> => {
    const interval = RANGE_INTERVALS[range]

    const [bookingsResult, trainerResult] = await Promise.all([
      pool.query(
        `SELECT
           cs.id                                                      AS "sessionId",
           COALESCE(cs.name_override, ct.name)                        AS "name",
           cs.session_date::text                                      AS "sessionDate",
           COALESCE(cs.start_time_override, cs.start_time)::text      AS "startTime",
           COALESCE(cs.end_time_override, cs.end_time)::text          AS "endTime",
           COALESCE(
             m_override.firstname || ' ' || m_override.lastname,
             m.firstname || ' ' || m.lastname
           )                                                          AS "trainerName",
           COALESCE(r_override.name, r.name)                          AS "roomName",
           ct.banner_image_url                                        AS "bannerImageUrl",
           cs.is_cancelled                                            AS "isCancelled",
           cs.updated_at::text                                        AS "updatedAt",
           cb.id::text                                                AS "bookingId",
           'booking'                                                  AS "role"
         FROM course_bookings cb
           JOIN course_sessions cs ON cs.id = cb.session_id
           JOIN course_templates ct ON ct.id = cs.template_id
           LEFT JOIN members m ON ct.trainer_id = m.id
           LEFT JOIN members m_override ON cs.trainer_id_override = m_override.id
           LEFT JOIN rooms r ON ct.room_id = r.id
           LEFT JOIN rooms r_override ON cs.room_id_override = r_override.id
         WHERE cb.member_id = $1
           AND cs.session_date >= CURRENT_DATE
           AND cs.session_date <= CURRENT_DATE + $2::interval
         ORDER BY cs.session_date, COALESCE(cs.start_time_override, cs.start_time)`,
        [memberId, interval]
      ),

      isTrainer
        ? pool.query(
            `SELECT
               cs.id                                                      AS "sessionId",
               COALESCE(cs.name_override, ct.name)                        AS "name",
               cs.session_date::text                                      AS "sessionDate",
               COALESCE(cs.start_time_override, cs.start_time)::text      AS "startTime",
               COALESCE(cs.end_time_override, cs.end_time)::text          AS "endTime",
               COALESCE(
                 m_override.firstname || ' ' || m_override.lastname,
                 m.firstname || ' ' || m.lastname
               )                                                          AS "trainerName",
               COALESCE(r_override.name, r.name)                          AS "roomName",
               ct.banner_image_url                                        AS "bannerImageUrl",
               cs.is_cancelled                                            AS "isCancelled",
               cs.updated_at::text                                        AS "updatedAt",
               'trainer'                                                  AS "role"
             FROM course_sessions cs
               JOIN course_templates ct ON ct.id = cs.template_id
               LEFT JOIN members m ON ct.trainer_id = m.id
               LEFT JOIN members m_override ON cs.trainer_id_override = m_override.id
               LEFT JOIN rooms r ON ct.room_id = r.id
               LEFT JOIN rooms r_override ON cs.room_id_override = r_override.id
             WHERE COALESCE(cs.trainer_id_override, ct.trainer_id) = $1
               AND cs.session_date >= CURRENT_DATE
               AND cs.session_date <= CURRENT_DATE + $2::interval
             ORDER BY cs.session_date, COALESCE(cs.start_time_override, cs.start_time)`,
            [memberId, interval]
          )
        : Promise.resolve({ rows: [] }),
    ])

    const allRows = [...bookingsResult.rows, ...trainerResult.rows]
    const seen = new Set<string>()

    return allRows
      .filter((row) => {
        if (seen.has(row.sessionId)) return false
        seen.add(row.sessionId)
        return true
      })
      .map((row) => ({
        sessionId: row.sessionId,
        name: row.name,
        sessionDate: row.sessionDate,
        startTime: row.startTime.slice(0, 5),
        endTime: row.endTime.slice(0, 5),
        trainerName: row.trainerName ?? undefined,
        roomName: row.roomName ?? undefined,
        bannerImageUrl: row.bannerImageUrl ?? undefined,
        isCancelled: row.isCancelled,
        role: row.role as 'booking' | 'trainer',
        updatedAt: row.updatedAt ?? undefined,
        bookingId: row.bookingId ?? undefined,
      }))
      .sort((a, b) => {
        const dateCompare = a.sessionDate.localeCompare(b.sessionDate)
        if (dateCompare !== 0) return dateCompare
        return a.startTime.localeCompare(b.startTime)
      })
  },
  ['get-upcoming-courses'],
  { revalidate: 3600, tags: ['courses'] }
)

export async function getUpcomingCourses(
  range: UpcomingRange
): Promise<DashboardUpcomingCourse[]> {
  const { member } = await getSession()

  if (!member) {
    return []
  }

  return getUpcomingCoursesCached(member.id, member.isTrainer ?? false, range)
}
