'use server'

import { unstable_cache } from 'next/cache'

import { getSession } from '@/features/auth'
import { RoomMinimal } from '@/features/courses'
import { pool } from '@/features/shared/lib/db'

const getRoomsMinimalCached = unstable_cache(
  async (): Promise<RoomMinimal[]> => {
    const result = await pool.query(`
      SELECT id, name, capacity FROM rooms ORDER BY name
    `)
    return result.rows.map((row) => ({
      ...row,
      capacity: parseInt(row.capacity, 10),
    }))
  },
  ['get-rooms-minimal'],
  { revalidate: 3600, tags: ['rooms'] }
)

export async function getRoomsMinimal(): Promise<RoomMinimal[]> {
  const { member } = await getSession()

  if (!member || !member.isTrainer) {
    return []
  }

  return getRoomsMinimalCached()
}
