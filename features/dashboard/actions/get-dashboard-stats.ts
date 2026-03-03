'use server'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export interface BookingDayStat {
  date: string
  count: number
}

export interface DashboardStats {
  totalUpcomingBookings: number
  bookingsPerDay: BookingDayStat[]
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { member } = await getSession()

  if (!member) {
    return { totalUpcomingBookings: 0, bookingsPerDay: [] }
  }

  const today = new Date().toISOString().split('T')[0]

  const [upcomingResult, historyResult] = await Promise.all([
    pool.query(
      `SELECT COUNT(*) AS count
       FROM course_bookings cb
         JOIN course_sessions cs ON cs.id = cb.session_id
       WHERE cb.member_id = $1
         AND cs.session_date >= $2::date
         AND cs.is_cancelled = false`,
      [member.id, today]
    ),
    pool.query(
      `SELECT cs.session_date::text AS date, COUNT(*) AS count
       FROM course_bookings cb
         JOIN course_sessions cs ON cs.id = cb.session_id
       WHERE cb.member_id = $1
         AND cs.session_date >= ($2::date - INTERVAL '6 days')
         AND cs.session_date <= $2::date
       GROUP BY cs.session_date
       ORDER BY cs.session_date`,
      [member.id, today]
    ),
  ])

  const totalUpcomingBookings = parseInt(
    upcomingResult.rows[0]?.count || '0',
    10
  )

  const historyMap = new Map<string, number>(
    historyResult.rows.map((row: { date: string; count: string }) => [
      row.date,
      parseInt(row.count, 10),
    ])
  )

  const bookingsPerDay: BookingDayStat[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    return { date: dateStr, count: historyMap.get(dateStr) ?? 0 }
  })

  return { totalUpcomingBookings, bookingsPerDay }
}
