'use server'

import { updateTag } from 'next/cache'

import { createAuditLog } from '@/features/audit-logs'
import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function deletePlan(id: string) {
  const { member } = await getSession()

  const result = await pool.query('SELECT name FROM plans WHERE id = $1', [id])
  const planName = result.rows[0] ? result.rows[0].name : 'Unknown plan'

  if (member) {
    await createAuditLog({
      memberId: member.id,
      action: 'DELETE',
      entityId: id,
      entityType: 'plan',
      description: `Plan ${planName} deleted`,
    })
  }

  await pool.query('DELETE FROM plans WHERE id = $1', [id])
  updateTag('plans')
  updateTag('members')
}
