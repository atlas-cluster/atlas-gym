'use server'

import { getPool } from '@/features/shared/lib/db'

export async function ping(): Promise<boolean> {
  const sql = getPool()
  try {
    await sql`SELECT 1`
    return true
  } catch {
    return false
  }
}
