'use server'

import { unstable_cache } from 'next/cache'

import { PlanDisplay } from '@/features/plans/types'
import { pool } from '@/features/shared/lib/db'

const getPlansCached = unstable_cache(
  async (): Promise<PlanDisplay[]> => {
    const query = `
      SELECT p.id,
             p.name,
             p.price,
             p.min_duration_months as "minDurationMonths",
             p.description,
             p.created_at as "createdAt",
             p.updated_at as "updatedAt",
             COUNT(s.id) FILTER (WHERE s.end_date IS NULL) as "subscriptionCount"
      FROM plans p
             LEFT JOIN subscriptions s ON p.id = s.plan_id
      GROUP BY p.id
      ORDER BY p.name
    `

    const result = await pool.query(query)
    return result.rows.map((row) => ({
      ...row,
      price: parseFloat(row.price),
      subscriptionCount: parseInt(row.subscriptionCount) || 0,
    }))
  },
  ['plans-list'],
  { revalidate: 3600, tags: ['plans'] }
)

export async function getPlans(): Promise<PlanDisplay[]> {
  return getPlansCached()
}
