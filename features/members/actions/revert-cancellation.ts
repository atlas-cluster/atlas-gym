'use server'

import { revalidateTag } from 'next/cache'

import { pool } from '@/features/shared/lib/db'

export async function revertCancellation(
  subscriptionId: string
): Promise<void> {
  const query = `
    UPDATE subscriptions
    SET end_date = NULL,
        updated_at = now()
    WHERE id = $1
  `

  await pool.query(query, [subscriptionId])
  revalidateTag('members')
}
