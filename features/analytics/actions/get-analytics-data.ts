'use server'

import { unstable_cache } from 'next/cache'

import type {
  AnalyticsData,
  BookingsTrendPoint,
  ChurnChartPoint,
  CoursePerformanceRow,
  KpiData,
  MemberAgeBucket,
  PaymentMethodItem,
  PeakHourCell,
  PlanRankingRow,
  RevenueByPlan,
  RevenueChartPoint,
  RoomUtilizationRow,
  SubscriptionDistributionItem,
  TrainerLeaderboardRow,
} from '@/features/analytics/types'
import { pool } from '@/features/shared/lib/db'

const getAnalyticsDataCached = unstable_cache(
  async (): Promise<AnalyticsData> => {
    const [
      kpiResult,
      revenueChartResult,
      revenueByPlanResult,
      subscriptionDistResult,
      churnChartResult,
      planRankingResult,
      coursePerformanceResult,
      bookingsTrendResult,
      peakHoursResult,
      trainerLeaderboardResult,
      roomUtilizationResult,
      memberAgeResult,
      paymentMethodResult,
    ] = await Promise.all([
      // 1. KPI data
      pool.query(`
        SELECT
          (SELECT COUNT(*) FROM members) AS total_members,
          (SELECT COUNT(*) FROM subscriptions
           WHERE start_date <= CURRENT_DATE
             AND (end_date IS NULL OR end_date >= CURRENT_DATE)) AS active_subs,
          (SELECT COUNT(*) FROM subscriptions
           WHERE end_date IS NOT NULL
             AND start_date <= CURRENT_DATE
             AND end_date >= CURRENT_DATE) AS cancelled_subs,
          (SELECT COALESCE(SUM(p.price), 0) FROM subscriptions s
           JOIN plans p ON p.id = s.plan_id
           WHERE s.start_date <= CURRENT_DATE
             AND (s.end_date IS NULL OR s.end_date >= CURRENT_DATE)) AS mrr,
          (SELECT COUNT(*) FROM course_bookings cb
           JOIN course_sessions cs ON cs.id = cb.session_id
           WHERE cs.session_date >= date_trunc('month', CURRENT_DATE)
             AND cs.session_date < date_trunc('month', CURRENT_DATE) + interval '1 month') AS bookings_this_month,
          (SELECT COUNT(*) FROM course_sessions
           WHERE session_date >= date_trunc('month', CURRENT_DATE)
             AND session_date < date_trunc('month', CURRENT_DATE) + interval '1 month'
             AND is_cancelled = FALSE) AS total_sessions,
          (SELECT CASE WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND(AVG(sub.booking_count)::numeric, 1)
            END
           FROM (
             SELECT cs.id, COUNT(cb.id) AS booking_count
             FROM course_sessions cs
             LEFT JOIN course_bookings cb ON cb.session_id = cs.id
             WHERE cs.session_date >= CURRENT_DATE - interval '1 month'
               AND cs.session_date <= CURRENT_DATE
               AND cs.is_cancelled = FALSE
             GROUP BY cs.id
           ) sub) AS avg_bookings_per_session,
          (SELECT COUNT(*) FROM course_templates
           WHERE (end_date IS NULL OR end_date >= CURRENT_DATE)) AS total_templates
      `),

      // 2. Revenue chart - monthly MRR for last 12 months
      pool.query(`
        SELECT
          TO_CHAR(d.month, 'Mon YY') AS "month",
          COALESCE((
            SELECT SUM(p.price)
            FROM subscriptions s
            JOIN plans p ON p.id = s.plan_id
            WHERE s.start_date <= (d.month + interval '1 month' - interval '1 day')::date
              AND (s.end_date IS NULL OR s.end_date >= d.month)
          ), 0)::numeric AS revenue
        FROM (
          SELECT generate_series(
            date_trunc('month', CURRENT_DATE) - interval '11 months',
            date_trunc('month', CURRENT_DATE),
            interval '1 month'
          )::date AS month
        ) d
        ORDER BY d.month
      `),

      // 3. Revenue by plan
      pool.query(`
        SELECT
          p.name,
          (p.price * COUNT(*))::numeric AS revenue,
          COUNT(*)::int AS subscribers
        FROM subscriptions s
        JOIN plans p ON p.id = s.plan_id
        WHERE s.start_date <= CURRENT_DATE
          AND (s.end_date IS NULL OR s.end_date >= CURRENT_DATE)
        GROUP BY p.id, p.name, p.price
        ORDER BY revenue DESC
      `),

      // 3. Subscription distribution
      pool.query(`
        SELECT p.name, COUNT(*)::int AS count
        FROM subscriptions s
        JOIN plans p ON p.id = s.plan_id
        WHERE s.start_date <= CURRENT_DATE
          AND (s.end_date IS NULL OR s.end_date >= CURRENT_DATE)
        GROUP BY p.name
        ORDER BY count DESC
      `),

      // 4. Churn chart
      pool.query(`
        SELECT
          TO_CHAR(d.month, 'Mon YY') AS "month",
          COALESCE(ch.churned, 0)::int AS churned,
          COALESCE(ns.new_subs, 0)::int AS "newSubs"
        FROM (
          SELECT generate_series(
            date_trunc('month', CURRENT_DATE) - interval '11 months',
            date_trunc('month', CURRENT_DATE),
            interval '1 month'
          )::date AS month
        ) d
        LEFT JOIN (
          SELECT date_trunc('month', end_date)::date AS month, COUNT(*)::int AS churned
          FROM subscriptions
          WHERE end_date IS NOT NULL AND end_date >= CURRENT_DATE - interval '12 months'
          GROUP BY 1
        ) ch ON ch.month = d.month
        LEFT JOIN (
          SELECT date_trunc('month', created_at)::date AS month, COUNT(*)::int AS new_subs
          FROM subscriptions
          WHERE created_at >= CURRENT_DATE - interval '12 months'
          GROUP BY 1
        ) ns ON ns.month = d.month
        ORDER BY d.month
      `),

      // 5. Plan ranking
      pool.query(`
        SELECT
          p.name,
          COUNT(*)::int AS subscribers,
          (p.price * COUNT(*))::numeric AS mrr,
          ROUND(AVG((COALESCE(s.end_date, CURRENT_DATE) - s.start_date)::numeric / 30.44))::int AS "avgTenureMonths",
          p.price::numeric AS price
        FROM subscriptions s
        JOIN plans p ON p.id = s.plan_id
        WHERE s.start_date <= CURRENT_DATE
          AND (s.end_date IS NULL OR s.end_date >= CURRENT_DATE)
        GROUP BY p.id, p.name, p.price
        ORDER BY subscribers DESC
      `),

      // 6. Course performance
      pool.query(`
        SELECT
          ct.name,
          (m.firstname || ' ' || m.lastname) AS "trainerName",
          ct.banner_image_url AS "bannerImageUrl",
          COALESCE(SUM(stats.booking_count), 0)::int AS "totalBookings",
          COUNT(cs.id)::int AS "totalSessions",
          COUNT(cs.id) FILTER (WHERE cs.is_cancelled)::int AS "cancelledSessions",
          CASE WHEN COUNT(cs.id) FILTER (WHERE NOT cs.is_cancelled) = 0 THEN 0
            ELSE ROUND(COALESCE(SUM(stats.booking_count), 0)::numeric
              / COUNT(cs.id) FILTER (WHERE NOT cs.is_cancelled), 1)
          END AS "avgBookingsPerSession",
          CASE WHEN COUNT(cs.id) = 0 THEN 0
            ELSE ROUND(COUNT(cs.id) FILTER (WHERE cs.is_cancelled)::numeric
              / COUNT(cs.id) * 100, 1)
          END AS "cancellationRate"
        FROM course_templates ct
        LEFT JOIN members m ON ct.trainer_id = m.id
        LEFT JOIN course_sessions cs ON cs.template_id = ct.id
          AND cs.session_date >= CURRENT_DATE - interval '3 months'
          AND cs.session_date <= CURRENT_DATE
        LEFT JOIN LATERAL (
          SELECT COUNT(*)::int AS booking_count
          FROM course_bookings cb
          WHERE cb.session_id = cs.id
        ) stats ON true
        GROUP BY ct.id, ct.name, m.firstname, m.lastname
        ORDER BY "totalBookings" DESC
      `),

      // 7. Bookings trend
      pool.query(`
        SELECT
          TO_CHAR(date_trunc('week', cs.session_date), 'DD.MM') AS week,
          COUNT(cb.id)::int AS bookings
        FROM course_sessions cs
        JOIN course_bookings cb ON cb.session_id = cs.id
        WHERE cs.session_date >= CURRENT_DATE - interval '3 months'
          AND cs.session_date <= CURRENT_DATE
        GROUP BY date_trunc('week', cs.session_date)
        ORDER BY date_trunc('week', cs.session_date)
      `),

      // 8. Peak hours heatmap
      pool.query(`
        SELECT
          EXTRACT(DOW FROM cs.session_date)::int AS weekday,
          EXTRACT(HOUR FROM COALESCE(cs.start_time_override, cs.start_time))::int AS hour,
          COUNT(cb.id)::int AS bookings
        FROM course_sessions cs
        JOIN course_bookings cb ON cb.session_id = cs.id
        WHERE cs.session_date >= CURRENT_DATE - interval '3 months'
          AND cs.session_date <= CURRENT_DATE
          AND cs.is_cancelled = FALSE
        GROUP BY 1, 2
        ORDER BY 1, 2
      `),

      // 9. Trainer leaderboard
      pool.query(`
        SELECT
          (m.firstname || ' ' || m.lastname) AS name,
          COUNT(DISTINCT cs.id)::int AS "sessionsTaught",
          COUNT(cb.id)::int AS "totalBookings",
          CASE WHEN COUNT(DISTINCT cs.id) FILTER (WHERE NOT cs.is_cancelled) = 0 THEN 0
            ELSE ROUND(COUNT(cb.id)::numeric
              / COUNT(DISTINCT cs.id) FILTER (WHERE NOT cs.is_cancelled), 1)
          END AS "avgBookingsPerSession",
          CASE WHEN COUNT(DISTINCT cs.id) = 0 THEN 0
            ELSE ROUND(COUNT(DISTINCT cs.id) FILTER (WHERE cs.is_cancelled)::numeric
              / COUNT(DISTINCT cs.id) * 100, 1)
          END AS "cancellationRate"
        FROM trainers t
        JOIN members m ON m.id = t.member_id
        LEFT JOIN course_templates ct ON ct.trainer_id = t.member_id
        LEFT JOIN course_sessions cs ON cs.template_id = ct.id
          AND cs.session_date >= CURRENT_DATE - interval '3 months'
          AND cs.session_date <= CURRENT_DATE
        LEFT JOIN course_bookings cb ON cb.session_id = cs.id AND NOT cs.is_cancelled
        GROUP BY t.member_id, m.firstname, m.lastname
        ORDER BY "totalBookings" DESC
      `),

      // 10. Room utilization
      pool.query(`
        SELECT
          r.name,
          COUNT(DISTINCT cs.id)::int AS "totalSessions",
          COUNT(cb.id)::int AS "totalBookings",
          CASE WHEN COUNT(DISTINCT cs.id) FILTER (WHERE NOT cs.is_cancelled) = 0 THEN 0
            ELSE ROUND(COUNT(cb.id)::numeric
              / COUNT(DISTINCT cs.id) FILTER (WHERE NOT cs.is_cancelled), 1)
          END AS "avgBookingsPerSession"
        FROM rooms r
        LEFT JOIN course_templates ct ON ct.room_id = r.id
        LEFT JOIN course_sessions cs ON cs.template_id = ct.id
          AND cs.session_date >= CURRENT_DATE - interval '3 months'
          AND cs.session_date <= CURRENT_DATE
        LEFT JOIN course_bookings cb ON cb.session_id = cs.id AND NOT cs.is_cancelled
        GROUP BY r.id, r.name
        ORDER BY "totalSessions" DESC
      `),

      // 11. Member age distribution (3-year buckets)
      pool.query(`
        SELECT bucket, COUNT(*)::int AS count
        FROM (
          SELECT
            CASE
              WHEN member_age < 18 THEN 'Under 18'
              WHEN member_age BETWEEN 18 AND 20 THEN '18-20'
              WHEN member_age BETWEEN 21 AND 23 THEN '21-23'
              WHEN member_age BETWEEN 24 AND 26 THEN '24-26'
              WHEN member_age BETWEEN 27 AND 29 THEN '27-29'
              WHEN member_age BETWEEN 30 AND 32 THEN '30-32'
              WHEN member_age BETWEEN 33 AND 35 THEN '33-35'
              WHEN member_age BETWEEN 36 AND 38 THEN '36-38'
              WHEN member_age BETWEEN 39 AND 41 THEN '39-41'
              WHEN member_age BETWEEN 42 AND 44 THEN '42-44'
              WHEN member_age BETWEEN 45 AND 49 THEN '45-49'
              WHEN member_age BETWEEN 50 AND 54 THEN '50-54'
              WHEN member_age BETWEEN 55 AND 59 THEN '55-59'
              ELSE '60+'
            END AS bucket,
            member_age
          FROM (
            SELECT EXTRACT(YEAR FROM age(CURRENT_DATE, birthdate))::int AS member_age
            FROM members
          ) ages
        ) bucketed
        GROUP BY bucket
        ORDER BY MIN(member_age)
      `),

      // 12. Payment method distribution
      pool.query(`
        SELECT
          CASE payment_type
            WHEN 'credit_card' THEN 'Credit Card'
            WHEN 'iban' THEN 'Bank Transfer'
          END AS method,
          COUNT(*)::int AS count
        FROM members
        GROUP BY payment_type
        ORDER BY count DESC
      `),
    ])

    // Build KPI data
    const kpiRow = kpiResult.rows[0]
    const kpis: KpiData = {
      totalMembers: parseInt(kpiRow.total_members),
      activeSubscriptions: parseInt(kpiRow.active_subs),
      cancelledSubscriptions: parseInt(kpiRow.cancelled_subs),
      monthlyRecurringRevenue: parseFloat(kpiRow.mrr),
      totalBookingsThisMonth: parseInt(kpiRow.bookings_this_month),
      totalCourseSessions: parseInt(kpiRow.total_sessions),
      avgBookingsPerSession: parseFloat(kpiRow.avg_bookings_per_session),
      totalCourseTemplates: parseInt(kpiRow.total_templates),
    }

    const revenueChart: RevenueChartPoint[] = revenueChartResult.rows.map(
      (row) => ({
        month: row.month,
        revenue: Math.round(parseFloat(row.revenue)),
      })
    )

    const revenueByPlan: RevenueByPlan[] = revenueByPlanResult.rows.map(
      (row) => ({
        name: row.name,
        revenue: parseFloat(row.revenue),
        subscribers: row.subscribers,
      })
    )

    const subscriptionDistribution: SubscriptionDistributionItem[] =
      subscriptionDistResult.rows.map((row) => ({
        name: row.name,
        count: row.count,
      }))

    const churnChart: ChurnChartPoint[] = churnChartResult.rows.map((row) => ({
      month: row.month,
      churned: row.churned,
      newSubs: row.newSubs,
    }))

    const planRanking: PlanRankingRow[] = planRankingResult.rows.map((row) => ({
      name: row.name,
      subscribers: row.subscribers,
      mrr: parseFloat(row.mrr),
      avgTenureMonths: row.avgTenureMonths ?? 0,
      price: parseFloat(row.price),
    }))

    const coursePerformance: CoursePerformanceRow[] =
      coursePerformanceResult.rows.map((row) => ({
        name: row.name,
        trainerName: row.trainerName ?? undefined,
        bannerImageUrl: row.bannerImageUrl ?? undefined,
        totalBookings: row.totalBookings,
        totalSessions: row.totalSessions,
        cancelledSessions: row.cancelledSessions,
        avgBookingsPerSession: parseFloat(row.avgBookingsPerSession),
        cancellationRate: parseFloat(row.cancellationRate),
      }))

    const bookingsTrend: BookingsTrendPoint[] = bookingsTrendResult.rows.map(
      (row) => ({
        week: row.week,
        bookings: row.bookings,
      })
    )

    const peakHours: PeakHourCell[] = peakHoursResult.rows.map((row) => ({
      weekday: row.weekday,
      hour: row.hour,
      bookings: row.bookings,
    }))

    const trainerLeaderboard: TrainerLeaderboardRow[] =
      trainerLeaderboardResult.rows.map((row) => ({
        name: row.name,
        sessionsTaught: row.sessionsTaught,
        totalBookings: row.totalBookings,
        avgBookingsPerSession: parseFloat(row.avgBookingsPerSession),
        cancellationRate: parseFloat(row.cancellationRate),
      }))

    const roomUtilization: RoomUtilizationRow[] =
      roomUtilizationResult.rows.map((row) => ({
        name: row.name,
        totalSessions: row.totalSessions,
        totalBookings: row.totalBookings,
        avgBookingsPerSession: parseFloat(row.avgBookingsPerSession),
      }))

    const memberAge: MemberAgeBucket[] = memberAgeResult.rows.map((row) => ({
      bucket: row.bucket,
      count: row.count,
    }))

    const paymentMethodDistribution: PaymentMethodItem[] =
      paymentMethodResult.rows.map((row) => ({
        method: row.method,
        count: row.count,
      }))

    return {
      kpis,
      revenueChart,
      revenueByPlan,
      subscriptionDistribution,
      churnChart,
      planRanking,
      coursePerformance,
      bookingsTrend,
      peakHours,
      trainerLeaderboard,
      roomUtilization,
      memberAge,
      paymentMethodDistribution,
    }
  },
  ['get-analytics-data'],
  {
    revalidate: 60,
    tags: ['members', 'subscriptions', 'plans', 'courses', 'rooms'],
  }
)

export async function getAnalyticsData(): Promise<AnalyticsData> {
  return getAnalyticsDataCached()
}
