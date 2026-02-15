'use server'

import { updateTag } from 'next/cache'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function revertCancellation(
  subscriptionId: string,
  targetMemberId?: string
): Promise<void> {
  const session = await getSession()
  if (!session.authenticated || !session.member) {
    throw new Error('Unauthorized')
  }

  // If targetMemberId is provided, verify the user is a trainer
  let memberId: string
  if (targetMemberId) {
    if (!session.member.isTrainer) {
      throw new Error(
        'Only trainers can revert cancellations for other members'
      )
    }
    memberId = targetMemberId
  } else {
    memberId = session.member.id
  }

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

  // Delete any future subscription FIRST (before updating to avoid constraint violation)
  // The unique_active_subscription constraint prevents multiple subscriptions with end_date IS NULL
  const deleteFutureQuery = `
    DELETE FROM subscriptions
    WHERE member_id = $1 
      AND start_date > $2
  `

  await pool.query(deleteFutureQuery, [memberId, subscription.start_date])

  // Now remove the end_date to revert the cancellation
  const updateQuery = `
    UPDATE subscriptions
    SET end_date = NULL, updated_at = NOW()
    WHERE id = $1 AND member_id = $2
  `

  await pool.query(updateQuery, [subscriptionId, memberId])

  updateTag('subscriptions')
  updateTag('members')
  
  // Create audit log
  const { createAuditLog } = await import('@/features/audit-logs')
  
  await createAuditLog({
    memberId: session.member.id,
    entityId: subscriptionId,
    entityType: 'subscription',
    action: 'UPDATE',
    description: targetMemberId
      ? `Reverted subscription cancellation for member`
      : `Reverted subscription cancellation`,
  }).catch((error) => console.error('Failed to create audit log:', error))
}
