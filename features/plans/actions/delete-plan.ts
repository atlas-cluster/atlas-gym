'use server'

import { updateTag } from 'next/cache'

import { createAuditLog } from '@/features/audit-logs'
import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function deletePlan(id: string) {
  const { member } = await getSession()

  const result = await pool.query('SELECT name FROM plans WHERE id = $1', [id])
  const planName = result.rows[0] ? result.rows[0].name : 'Unknown plan'

  // Get all subscriptions for this plan to log their deletion
  const subscriptionsResult = await pool.query(
    'SELECT id FROM subscriptions WHERE plan_id = $1',
    [id]
  )
  const subscriptionIds = subscriptionsResult.rows.map((row) => row.id)

  // Delete all subscriptions for this plan
  if (subscriptionIds.length > 0) {
    await pool.query('DELETE FROM subscriptions WHERE plan_id = $1', [id])

    // Create audit logs for deleted subscriptions
    if (member) {
      for (const subscriptionId of subscriptionIds) {
        await createAuditLog({
          memberId: member.id,
          action: 'Delete',
          entityId: subscriptionId,
          entityType: 'subscription',
          description: `Subscription deleted due to plan ${planName} deletion`,
        })
      }
    }
  }

  if (member) {
    await createAuditLog({
      memberId: member.id,
      action: 'Delete',
      entityId: id,
      entityType: 'plan',
      description: `Plan ${planName} deleted`,
    })
  }

  await pool.query('DELETE FROM plans WHERE id = $1', [id])
  updateTag('plans')
  updateTag('subscriptions')
  updateTag('members')
}
