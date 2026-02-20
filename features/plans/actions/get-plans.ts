'use server'

import { unstable_cache } from 'next/cache'

import { PlanDisplay } from '@/features/plans/types'
import { pool } from '@/features/shared/lib/db'

const getPlansCached = unstable_cache(
  async (): Promise<PlanDisplay[]> => {
    const plansResponse = await pool.query(`
      SELECT p.id,
             p.name,
             p.price,
             p.min_duration_months as "minDurationMonths",
             p.description,
             p.created_at as "createdAt",
             p.updated_at as "updatedAt",
             COUNT(s.id) FILTER (WHERE s.start_date <= CURRENT_DATE AND (s.end_date IS NULL OR s.end_date >= CURRENT_DATE)) as "subscriptionCount"
      FROM plans p
             LEFT JOIN subscriptions s ON p.id = s.plan_id
      GROUP BY p.id, p.name, p.price, p.min_duration_months, p.description, p.created_at, p.updated_at
      ORDER BY p.name
    `)
    return plansResponse.rows.map((row) => ({
      ...row,
      price: parseFloat(row.price),
      subscriptionCount: parseInt(row.subscriptionCount, 10),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }))
  },
  ['get-plans'],
  { revalidate: 3600, tags: ['plans'] }
)

export async function getPlans(): Promise<PlanDisplay[]> {
  return getPlansCached()
}
