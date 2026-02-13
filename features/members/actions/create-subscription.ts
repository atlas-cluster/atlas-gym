'use server'

import { revalidateTag } from 'next/cache'

import { pool } from '@/features/shared/lib/db'

export async function createSubscription(
  memberId: string,
  planId: number,
  isFuture: boolean = false
): Promise<void> {
  let query: string
  let params: (string | number)[]

  if (isFuture) {
    // For future subscriptions, start date is based on when current subscription ends
    query = `
      INSERT INTO subscriptions (member_id, plan_id, start_date, end_date)
      SELECT $1, $2, COALESCE(
        (SELECT end_date FROM subscriptions WHERE member_id = $1 AND start_date <= CURRENT_DATE ORDER BY start_date DESC LIMIT 1),
        CURRENT_DATE
      ), NULL
    `
    params = [memberId, planId]
  } else {
    // For immediate subscriptions, start today
    query = `
      INSERT INTO subscriptions (member_id, plan_id, start_date, end_date)
      VALUES ($1, $2, CURRENT_DATE, NULL)
    `
    params = [memberId, planId]
  }

  await pool.query(query, params)
  revalidateTag('members')
}
