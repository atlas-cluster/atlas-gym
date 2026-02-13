'use server'

import { revalidateTag } from 'next/cache'

import { pool } from '@/features/shared/lib/db'

export async function createSubscription(
  memberId: string,
  planId: number,
  isFuture: boolean = false
): Promise<void> {
  const startDate = isFuture
    ? `(SELECT COALESCE(end_date, CURRENT_DATE) FROM subscriptions WHERE member_id = $1 AND start_date <= CURRENT_DATE ORDER BY start_date DESC LIMIT 1)`
    : 'CURRENT_DATE'

  const query = `
    INSERT INTO subscriptions (member_id, plan_id, start_date, end_date)
    VALUES ($1, $2, ${startDate}, NULL)
  `

  await pool.query(query, [memberId, planId])
  revalidateTag('members')
}
