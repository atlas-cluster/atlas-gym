'use server'

import { unstable_cache } from 'next/cache'

import { getSession } from '@/features/auth'
import { TrainerMinimal } from '@/features/courses/types'
import { pool } from '@/features/shared/lib/db'

const getTrainersMinimalCached = unstable_cache(
  async (): Promise<TrainerMinimal[]> => {
    const result = await pool.query(`
      SELECT t.member_id as id, m.firstname || ' ' || m.lastname as name
      FROM trainers t
      JOIN members m ON t.member_id = m.id
      ORDER BY m.firstname, m.lastname
    `)
    return result.rows
  },
  ['get-trainers-minimal'],
  { revalidate: 3600, tags: ['trainers'] }
)

export async function getTrainersMinimal(): Promise<TrainerMinimal[]> {
  const { member } = await getSession()

  if (!member || !member.isTrainer) {
    return []
  }

  return getTrainersMinimalCached()
}
