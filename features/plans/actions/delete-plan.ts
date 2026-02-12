'use server'

import { updateTag } from 'next/cache'

import { pool } from '@/features/shared/lib/db'

export async function deletePlan(id: number) {
  await pool.query('DELETE FROM plans WHERE id = $1', [id])
  updateTag('plans')
}
