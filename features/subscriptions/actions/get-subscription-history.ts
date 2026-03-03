'use server'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export interface SubscriptionHistoryEntry {
  id: string
  planName: string
  startDate: Date
  endDate?: Date
  isActive: boolean
  isCancelled: boolean
  isFuture: boolean
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
            p.name       AS "planName",
            s.start_date AS "startDate",
            s.end_date   AS "endDate",
            CASE
                WHEN s.start_date <= CURRENT_DATE
                    AND (s.end_date IS NULL OR s.end_date >= CURRENT_DATE)
                    THEN true
                ELSE false
                END      AS "isActive",
            CASE
                WHEN s.end_date IS NOT NULL AND s.end_date >= CURRENT_DATE
                    THEN true
                ELSE false
                END      AS "isCancelled",
            CASE
                WHEN s.start_date > CURRENT_DATE
                    THEN true
                ELSE false
                END      AS "isFuture"
     FROM subscriptions s
              JOIN plans p ON p.id = s.plan_id
     WHERE s.member_id = $1
     ORDER BY CASE
                  WHEN s.start_date <= CURRENT_DATE AND s.end_date IS NULL THEN 0
                  WHEN s.start_date > CURRENT_DATE THEN 1
                  WHEN s.start_date <= CURRENT_DATE AND s.end_date IS NOT NULL
                      AND s.end_date >= CURRENT_DATE THEN 2
                  ELSE 3
                  END,
              s.start_date DESC`,
    [member.id]
  )

  return result.rows.map((row) => ({
    id: row.id,
    planName: row.planName,
    startDate: new Date(row.startDate),
    endDate: row.endDate ? new Date(row.endDate) : undefined,
    isActive: row.isActive,
    isCancelled: row.isCancelled,
    isFuture: row.isFuture,
  }))
}
