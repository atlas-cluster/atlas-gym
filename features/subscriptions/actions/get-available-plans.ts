'use server'

import { unstable_cache } from 'next/cache'

import { getSession } from '@/features/auth'
import { PlanDisplay } from '@/features/plans'
import { pool } from '@/features/shared/lib/db'

const getAvailablePlansCached = unstable_cache(
  async (): Promise<PlanDisplay[]> => {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.min_duration_months as "minDurationMonths",
        p.description,
        p.created_at as "createdAt",
        p.updated_at as "updatedAt",
        COUNT(s.id) FILTER (WHERE s.end_date IS NULL) as "subscriptionCount"
      FROM plans p
      LEFT JOIN subscriptions s ON p.id = s.plan_id
      GROUP BY p.id, p.name, p.price, p.min_duration_months, p.description, p.created_at, p.updated_at
      ORDER BY p.name
    `

    const result = await pool.query(query)

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      price: parseFloat(row.price),
      minDurationMonths: row.minDurationMonths,
      description: row.description,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      subscriptionCount: parseInt(row.subscriptionCount || 0),
    }))
  },
  ['available-plans'],
  { revalidate: 3600, tags: ['plans', 'subscriptions'] }
)

export async function getAvailablePlans(): Promise<PlanDisplay[]> {
  const session = await getSession()
  if (!session.authenticated || !session.member) {
    throw new Error('Unauthorized')
  }

  return getAvailablePlansCached()
}
