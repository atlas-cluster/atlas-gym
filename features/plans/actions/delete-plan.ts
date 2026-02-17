'use server'

import { updateTag } from 'next/cache'

import { createAuditLog } from '@/features/audit-logs'
import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function deletePlan(id: string) {
  const { member } = await getSession()

  const result = await pool.query('SELECT name FROM plans WHERE id = $1', [id])
  const planName = result.rows[0] ? result.rows[0].name : 'Unknown plan'

  // Check if there are any subscriptions for this plan
  const subscriptionCheck = await pool.query(
    'SELECT COUNT(*) as count FROM subscriptions WHERE plan_id = $1',
    [id]
  )
  const subscriptionCount = parseInt(subscriptionCheck.rows[0].count, 10)

  if (subscriptionCount > 0) {
    throw new Error(
      `Cannot delete plan with ${subscriptionCount} existing subscription${subscriptionCount > 1 ? 's' : ''}`
    )
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
  updateTag('members')
}
