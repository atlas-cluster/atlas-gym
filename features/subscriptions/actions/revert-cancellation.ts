'use server'

import { updateTag } from 'next/cache'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function revertCancellation(
  subscriptionId: string
): Promise<void> {
  const session = await getSession()
  if (!session.authenticated || !session.member) {
    throw new Error('Unauthorized')
  }

  const memberId = session.member.id

  // Get subscription details
  const subQuery = `
    SELECT s.id, s.member_id, s.start_date, s.end_date
    FROM subscriptions s
    WHERE s.id = $1 AND s.member_id = $2
  `

  const subResult = await pool.query(subQuery, [subscriptionId, memberId])

  if (subResult.rows.length === 0) {
    throw new Error('Subscription not found')
  }

  const subscription = subResult.rows[0]

  if (!subscription.end_date) {
    throw new Error('Subscription is not cancelled')
  }

  const endDate = new Date(subscription.end_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (endDate < today) {
    throw new Error('Cannot revert a subscription that has already ended')
  }

  // Remove the end_date to revert the cancellation
  const updateQuery = `
    UPDATE subscriptions
    SET end_date = NULL, updated_at = NOW()
    WHERE id = $1 AND member_id = $2
  `

  await pool.query(updateQuery, [subscriptionId, memberId])

  // Delete any future subscription (scheduled to start after this one)
  const deleteFutureQuery = `
    DELETE FROM subscriptions
    WHERE member_id = $1 
      AND start_date > $2
  `

  await pool.query(deleteFutureQuery, [memberId, subscription.start_date])

  updateTag('subscriptions')
  updateTag('members')
}
