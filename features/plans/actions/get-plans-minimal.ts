'use server'

import { unstable_cache } from 'next/cache'

import { getSession } from '@/features/auth'
import { PlanDisplayMinimal } from '@/features/plans/types'
import { pool } from '@/features/shared/lib/db'

const getPlansMinimalCached = unstable_cache(
  async (): Promise<PlanDisplayMinimal[]> => {
    const plansResponse = await pool.query(`
      SELECT id,
             name,
             price,
             min_duration_months as "minDurationMonths",
             created_at as "createdAt",
             updated_at as "updatedAt"
      FROM plans 
      ORDER BY name
    `)
    return plansResponse.rows.map((row) => ({
      ...row,
      price: parseFloat(row.price),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }))
  },
  ['get-plans-minimal'],
  { revalidate: 3600, tags: ['plans'] }
)

export async function getPlansMinimal(): Promise<PlanDisplayMinimal[]> {
  const { member } = await getSession()

  if (!member || !member.isTrainer) {
    return []
  }

  return getPlansMinimalCached()
}
