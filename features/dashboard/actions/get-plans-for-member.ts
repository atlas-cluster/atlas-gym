'use server'

import { unstable_cache } from 'next/cache'

import { getSession } from '@/features/auth'
import { PlanDisplayMinimal } from '@/features/plans'
import { pool } from '@/features/shared/lib/db'

const getPlansForMemberCached = unstable_cache(
  async (): Promise<PlanDisplayMinimal[]> => {
    const result = await pool.query(`
      SELECT id,
             name,
             price,
             min_duration_months AS "minDurationMonths",
             created_at          AS "createdAt",
             updated_at          AS "updatedAt"
      FROM plans
      ORDER BY price
    `)
    return result.rows.map((row) => ({
      ...row,
      price: parseFloat(row.price),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }))
  },
  ['get-plans-for-member'],
  { revalidate: 3600, tags: ['plans'] }
)

export async function getPlansForMember(): Promise<PlanDisplayMinimal[]> {
  const { member } = await getSession()

  if (!member) {
    return []
  }

  return getPlansForMemberCached()
}
