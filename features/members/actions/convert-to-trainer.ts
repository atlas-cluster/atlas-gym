'use server'

import { updateTag } from 'next/cache'

import { pool } from '@/features/shared/lib/db'

export async function convertToTrainer(id: string) {
  await pool.query(
    `INSERT INTO trainers (member_id)
     VALUES ($1)
     ON CONFLICT (member_id) DO NOTHING`,
    [id]
  )
  updateTag('members')
}
