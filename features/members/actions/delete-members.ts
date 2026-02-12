'use server'

import { updateTag } from 'next/cache'

import { pool } from '@/features/shared/lib/db'

export async function deleteMembers(ids: string[]) {
  await pool.query('DELETE FROM gym_manager.members WHERE id = ANY($1)', [ids])
  updateTag('members')
}
