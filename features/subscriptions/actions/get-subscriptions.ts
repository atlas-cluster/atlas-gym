'use server'

import { unstable_cache } from 'next/cache'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'
import { SubscriptionDisplay } from '@/features/subscriptions'

const getSubscriptionsCached = unstable_cache(
  async (memberId: string): Promise<SubscriptionDisplay[]> => {
    const result = await pool.query(
      `SELECT p.id                  AS "planId",
                p.name,
                p.price,
                p.min_duration_months AS "minDurationMonths",
                p.description,
                s.id                  AS "id",
                s.start_date          AS "startDate",
                s.end_date            AS "endDate",
                s.updated_at          AS "updatedAt",
                CASE
                    WHEN s.id IS NOT NULL AND s.start_date <= CURRENT_DATE
                        AND (s.end_date IS NULL OR s.end_date >= CURRENT_DATE)
                        THEN true
                    ELSE false
                    END               AS "isActive",
                CASE
                    WHEN s.id IS NOT NULL AND s.end_date IS NOT NULL
                        AND s.end_date >= CURRENT_DATE
                        THEN true
                    ELSE false
                    END               AS "isCancelled",
                CASE
                    WHEN s.id IS NOT NULL AND s.start_date > CURRENT_DATE
                        THEN true
                    ELSE false
                    END               AS "isFuture"
         FROM plans p
                  LEFT JOIN subscriptions s
                            ON p.id = s.plan_id
                                AND s.member_id = $1
                                AND (s.start_date > CURRENT_DATE
                                       OR
                                   (s.start_date <= CURRENT_DATE AND (s.end_date IS NULL OR s.end_date >= CURRENT_DATE))
                                   )
         ORDER BY CASE
                      WHEN s.id IS NOT NULL AND s.start_date <= CURRENT_DATE AND s.end_date IS NULL THEN 0
                      WHEN s.id IS NOT NULL AND s.start_date <= CURRENT_DATE AND s.end_date IS NOT NULL THEN 1
                      WHEN s.id IS NOT NULL AND s.start_date > CURRENT_DATE THEN 2
                      ELSE 3
                      END,
                  p.name`,
      [memberId]
    )

    return result.rows.map((row) => ({
      id: row.id ?? undefined,
      planId: row.planId,
      name: row.name,
      price: parseFloat(row.price),
      minDurationMonths: row.minDurationMonths,
      description: row.description ?? undefined,
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
      startDate: row.startDate ? new Date(row.startDate) : undefined,
      endDate: row.endDate ? new Date(row.endDate) : undefined,
      isActive: row.isActive || undefined,
      isCancelled: row.isCancelled || undefined,
      isFuture: row.isFuture || undefined,
    }))
  },
  ['get-subscriptions'],
  { revalidate: 3600, tags: ['subscriptions', 'plans'] }
)

export async function getSubscriptions(): Promise<SubscriptionDisplay[]> {
  const { member } = await getSession()

  if (!member) {
    return []
  }

  return getSubscriptionsCached(member.id)
}
