'use server'

import { updateTag } from 'next/cache'

import { createAuditLog } from '@/features/audit-logs'
import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function deleteSubscription(
  subscriptionId: string,
  targetMemberId: string
): Promise<void> {
  const session = await getSession()
  if (!session.authenticated || !session.member) {
    throw new Error('Unauthorized')
  }

  // Verify the user is a trainer (admin)
  if (!session.member.isTrainer) {
    throw new Error('Only trainers can delete subscriptions')
  }

  // Get subscription details before deleting
  const subQuery = `
    SELECT s.id, s.member_id, s.start_date, s.end_date, p.name as plan_name, m.firstname, m.lastname
    FROM subscriptions s
    JOIN plans p ON s.plan_id = p.id
    JOIN members m ON s.member_id = m.id
    WHERE s.id = $1 AND s.member_id = $2
  `

  const subResult = await pool.query(subQuery, [subscriptionId, targetMemberId])

  if (subResult.rows.length === 0) {
    throw new Error('Subscription not found')
  }

  const subscription = subResult.rows[0]
  const memberName = `${subscription.firstname} ${subscription.lastname}`
  const planName = subscription.plan_name

  // Delete the subscription immediately, no matter the status or runtime
  const deleteQuery = `
    DELETE FROM subscriptions
    WHERE id = $1 AND member_id = $2
  `
  await pool.query(deleteQuery, [subscriptionId, targetMemberId])

  // Create audit log
  if (session.member) {
    await createAuditLog({
      memberId: session.member.id,
      action: 'Delete',
      entityId: subscriptionId,
      entityType: 'subscription',
      description: `Subscription to ${planName} forcefully removed by admin for ${memberName}`,
    })
  }

  updateTag('subscriptions')
  updateTag('members')
}
