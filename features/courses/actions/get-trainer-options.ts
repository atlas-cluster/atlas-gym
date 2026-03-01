'use server'
import { unstable_cache } from 'next/cache'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export interface TrainerOption {
  id: string
  name: string
}
const getTrainerOptionsCached = unstable_cache(
  async (): Promise<TrainerOption[]> => {
    const result = await pool.query(`
      SELECT t.member_id AS id,
             m.firstname || ' ' || m.lastname AS name
      FROM trainers t
        JOIN members m ON t.member_id = m.id
      ORDER BY m.firstname, m.lastname
    `)
    return result.rows
  },
  ['get-trainer-options'],
  { revalidate: 3600, tags: ['members'] }
)
export async function getTrainerOptions(): Promise<TrainerOption[]> {
  const { member } = await getSession()
  if (!member || !member.isTrainer) {
    return []
  }
  return getTrainerOptionsCached()
}
