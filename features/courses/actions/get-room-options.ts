'use server'

import { unstable_cache } from 'next/cache'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export interface RoomOption {
  id: string
  name: string
}

const getRoomOptionsCached = unstable_cache(
  async (): Promise<RoomOption[]> => {
    const result = await pool.query(`
      SELECT id, name
      FROM rooms
      ORDER BY name
    `)
    return result.rows
  },
  ['get-room-options'],
  { revalidate: 3600, tags: ['rooms'] }
)

export async function getRoomOptions(): Promise<RoomOption[]> {
  const { member } = await getSession()

  if (!member || !member.isTrainer) {
    return []
  }

  return getRoomOptionsCached()
}
