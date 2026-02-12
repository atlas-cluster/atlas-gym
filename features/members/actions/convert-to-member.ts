'use server'

import { updateTag } from 'next/cache'

import { pool } from '@/features/shared/lib/db'

export async function convertToMember(id: string) {
  await pool.query('DELETE FROM trainers WHERE member_id = $1', [id])
  updateTag('members')
}
