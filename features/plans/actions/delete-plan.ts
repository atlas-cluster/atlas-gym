'use server'

import { updateTag } from 'next/cache'

import { createAuditLog } from '@/features/audit-logs'
import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function deletePlan(id: string) {
  const session = await getSession()
  
  // Get plan name before deletion for audit log
  const planResult = await pool.query('SELECT name FROM plans WHERE id = $1', [id])
  const plan = planResult.rows[0]
  
  await pool.query('DELETE FROM plans WHERE id = $1', [id])
  updateTag('plans')
  updateTag('members')
  
  // Create audit log
  if (session.authenticated && session.member && plan) {
    await createAuditLog({
      memberId: session.member.id,
      entityId: id,
      entityType: 'plan',
      action: 'DELETE',
      description: `Deleted plan "${plan.name}"`,
    }).catch((error) => console.error('Failed to create audit log:', error))
  }
}
