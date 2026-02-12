'use server'

import { updateTag } from 'next/cache'

import { pool } from '@/features/shared/lib/db'

export async function deleteMember(id: string) {
  await pool.query('DELETE FROM members WHERE id = $1', [id])
  updateTag('members')
}
