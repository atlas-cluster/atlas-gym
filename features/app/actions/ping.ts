'use server'

import { pool } from '@/features/shared/lib/db'

export async function ping(): Promise<boolean> {
  try {
    await pool.query('SELECT 1')
    return true
  } catch {
    return false
  }
}
