'use server'

import { revalidateTag } from 'next/cache'

import { pool } from '@/features/shared/lib/db'

export async function cancelFutureSubscription(
  subscriptionId: string
): Promise<void> {
  const query = `
    DELETE FROM subscriptions
    WHERE id = $1
  `

  await pool.query(query, [subscriptionId])
  revalidateTag('members')
}
