'use server'

import { unstable_cache } from 'next/cache'

import { getSession } from '@/features/auth'
import { getUpcomingCourses } from '@/features/dashboard/actions/get-upcoming-courses'
import type {
  BookingsChartPoint,
  DashboardCourse,
  DashboardData,
  DashboardSubscriptionData,
  NextBookingData,
} from '@/features/dashboard/types'
import { pool } from '@/features/shared/lib/db'

const getDashboardDataCached = unstable_cache(
  async (memberId: string): Promise<Omit<DashboardData, 'upcomingCourses'>> => {
    const [
      subscriptionResult,
      nextBookingResult,
      chartResult,
      recommendedResult,
    ] = await Promise.all([
      // 1. Subscription data
      pool.query(
        `SELECT
           p.name,
           p.price,
           p.description,
           s.start_date,
           s.end_date
         FROM subscriptions s
           JOIN plans p ON p.id = s.plan_id
         WHERE s.member_id = $1
           AND s.start_date <= CURRENT_DATE
           AND (s.end_date IS NULL OR s.end_date >= CURRENT_DATE)
         ORDER BY s.start_date DESC
         LIMIT 1`,
        [memberId]
      ),

      // 2. Next booking
      pool.query(
        `SELECT
           COALESCE(cs.name_override, ct.name)                        AS "courseName",
           cs.session_date::text                                      AS "courseStartDate",
           COALESCE(cs.start_time_override, cs.start_time)::text      AS "courseStartTime",
           ct.banner_image_url                                        AS "bannerImageUrl",
           COALESCE(
             m_override.firstname || ' ' || m_override.lastname,
             m.firstname || ' ' || m.lastname
           )                                                          AS "trainerName",
           COALESCE(r_override.name, r.name)                          AS "roomName"
         FROM course_bookings cb
           JOIN course_sessions cs ON cs.id = cb.session_id
           JOIN course_templates ct ON ct.id = cs.template_id
           LEFT JOIN members m ON ct.trainer_id = m.id
           LEFT JOIN members m_override ON cs.trainer_id_override = m_override.id
           LEFT JOIN rooms r ON ct.room_id = r.id
           LEFT JOIN rooms r_override ON cs.room_id_override = r_override.id
         WHERE cb.member_id = $1
           AND cs.is_cancelled = FALSE
           AND (cs.session_date > CURRENT_DATE
                OR (cs.session_date = CURRENT_DATE
                    AND COALESCE(cs.start_time_override, cs.start_time) > CURRENT_TIME))
         ORDER BY cs.session_date, COALESCE(cs.start_time_override, cs.start_time)
         LIMIT 1`,
        [memberId]
      ),

      // 3. Bookings chart – 1 month past to 1 month future, daily
      pool.query(
        `SELECT
           TO_CHAR(d.day, 'DD.MM') AS "day",
           COALESCE(cnt.bookings, 0)::int AS "bookings",
           (d.day = CURRENT_DATE) AS "isToday"
         FROM (
           SELECT generate_series(
             CURRENT_DATE - interval '1 month',
             CURRENT_DATE + interval '1 month',
             interval '1 day'
           )::date AS day
         ) d
         LEFT JOIN (
           SELECT
             cs.session_date AS day,
             COUNT(*)::int AS bookings
           FROM course_bookings cb
             JOIN course_sessions cs ON cs.id = cb.session_id
           WHERE cb.member_id = $1
             AND cs.session_date >= CURRENT_DATE - interval '1 month'
             AND cs.session_date <= CURRENT_DATE + interval '1 month'
           GROUP BY 1
         ) cnt ON cnt.day = d.day
         ORDER BY d.day`,
        [memberId]
      ),

      // 4. Recommended courses (deterministic per user+day, seeded with md5)
      pool.query(
        `SELECT
           ct.id                                                      AS "templateId",
           ct.name,
           ct.description,
           ct.banner_image_url                                        AS "bannerImageUrl",
           ct.weekdays,
           ct.start_time::text                                        AS "startTime",
           ct.end_time::text                                          AS "endTime",
           m.firstname || ' ' || m.lastname                           AS "trainerName",
           r.name                                                     AS "roomName",
           next_session.id                                            AS "nextSessionId",
           next_session.session_date::text                            AS "nextSessionDate"
         FROM course_templates ct
           LEFT JOIN members m ON ct.trainer_id = m.id
           LEFT JOIN rooms r ON ct.room_id = r.id
           LEFT JOIN LATERAL (
             SELECT cs.id, cs.session_date
             FROM course_sessions cs
             WHERE cs.template_id = ct.id
               AND cs.is_cancelled = FALSE
               AND (cs.session_date > CURRENT_DATE
                    OR (cs.session_date = CURRENT_DATE
                        AND COALESCE(cs.start_time_override, cs.start_time) > CURRENT_TIME))
             ORDER BY cs.session_date, COALESCE(cs.start_time_override, cs.start_time)
             LIMIT 1
           ) next_session ON true
         WHERE (ct.end_date IS NULL OR ct.end_date >= CURRENT_DATE)
           AND ct.trainer_id IS DISTINCT FROM $1
           AND ct.id NOT IN (
             SELECT cs2.template_id
             FROM course_bookings cb2
               JOIN course_sessions cs2 ON cs2.id = cb2.session_id
             WHERE cb2.member_id = $1
               AND cs2.session_date >= CURRENT_DATE
           )
         ORDER BY md5(ct.id::text || $1::text || CURRENT_DATE::text)
         LIMIT 8`,
        [memberId]
      ),
    ])

    // Build subscription data
    const subRow = subscriptionResult.rows[0]
    const subscriptionData: DashboardSubscriptionData = {
      currentSubscriptionName: subRow?.name ?? undefined,
      currentSubscriptionPrice: subRow?.price
        ? parseFloat(subRow.price)
        : undefined,
      currentSubscriptionDescription: subRow?.description ?? undefined,
      subscriptionStartDate: subRow?.start_date
        ? new Date(subRow.start_date).toLocaleDateString('de-DE', {
            month: 'short',
            year: 'numeric',
          })
        : undefined,
      subscriptionEndDate: subRow?.end_date
        ? new Date(subRow.end_date).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : undefined,
      status: subRow ? (subRow.end_date ? 'cancelled' : 'active') : 'none',
    }

    // If current subscription has an end_date, check for upcoming subscription
    if (subRow?.end_date) {
      const upcomingResult = await pool.query(
        `SELECT p.name, s.start_date
         FROM subscriptions s
           JOIN plans p ON p.id = s.plan_id
         WHERE s.member_id = $1
           AND s.start_date > CURRENT_DATE
         ORDER BY s.start_date
         LIMIT 1`,
        [memberId]
      )
      if (upcomingResult.rows[0]) {
        subscriptionData.upComingSubscriptionName = upcomingResult.rows[0].name
        subscriptionData.upComingSubscriptionStartDate = new Date(
          upcomingResult.rows[0].start_date
        ).toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      }
    }

    // Build next booking data
    const bookingRow = nextBookingResult.rows[0]
    const nextBookingData: NextBookingData | undefined = bookingRow
      ? {
          courseName: bookingRow.courseName,
          courseStartDate: new Date(
            bookingRow.courseStartDate
          ).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
          }),
          courseStartTime: bookingRow.courseStartTime.slice(0, 5),
          bannerImageUrl: bookingRow.bannerImageUrl ?? undefined,
          trainerName: bookingRow.trainerName ?? undefined,
          roomName: bookingRow.roomName ?? undefined,
        }
      : undefined

    // Build chart data
    const bookingsChartData: BookingsChartPoint[] = chartResult.rows.map(
      (row) => ({
        day: row.day,
        bookings: row.bookings,
        isToday: row.isToday,
      })
    )

    // Build recommended courses
    const recommendedCourses: DashboardCourse[] = recommendedResult.rows.map(
      (row) => ({
        templateId: row.templateId,
        name: row.name,
        description: row.description ?? undefined,
        bannerImageUrl: row.bannerImageUrl ?? undefined,
        trainerName: row.trainerName ?? undefined,
        roomName: row.roomName ?? undefined,
        weekdays: Array.isArray(row.weekdays)
          ? row.weekdays
          : typeof row.weekdays === 'string'
            ? row.weekdays.replace(/[{}]/g, '').split(',').filter(Boolean)
            : [],
        startTime: row.startTime.slice(0, 5),
        endTime: row.endTime.slice(0, 5),
        nextSessionId: row.nextSessionId ?? undefined,
        nextSessionDate: row.nextSessionDate
          ? new Date(row.nextSessionDate).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: '2-digit',
            })
          : undefined,
      })
    )

    return {
      subscriptionData,
      nextBookingData,
      bookingsChartData,
      recommendedCourses,
    }
  },
  ['get-dashboard-data'],
  { revalidate: 3600, tags: ['courses', 'subscriptions'] }
)

export async function getDashboardData(): Promise<DashboardData> {
  const { member } = await getSession()

  if (!member) {
    return {
      subscriptionData: { status: 'none' },
      bookingsChartData: [],
      recommendedCourses: [],
      upcomingCourses: [],
    }
  }

  const [cachedData, upcomingCourses] = await Promise.all([
    getDashboardDataCached(member.id),
    getUpcomingCourses('7days'),
  ])

  return {
    ...cachedData,
    upcomingCourses,
  }
}
