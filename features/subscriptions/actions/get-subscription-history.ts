'use server'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export interface SubscriptionHistoryEntry {
  id: string
  planName: string
  startDate: Date
  endDate: Date
}

export async function getSubscriptionHistory(): Promise<
  SubscriptionHistoryEntry[]
> {
  const { member } = await getSession()

  if (!member) {
    return []
  }

  const result = await pool.query(
    `SELECT s.id,
            p.name  AS "planName",
            s.start_date AS "startDate",
            s.end_date   AS "endDate"
     FROM subscriptions s
              JOIN plans p ON p.id = s.plan_id
     WHERE s.member_id = $1
       AND s.end_date < CURRENT_DATE
     ORDER BY s.end_date DESC`,
    [member.id]
  )

  return result.rows.map((row) => ({
    id: row.id,
    planName: row.planName,
    startDate: new Date(row.startDate),
    endDate: new Date(row.endDate),
  }))
}
