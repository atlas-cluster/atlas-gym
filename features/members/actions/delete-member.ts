'use server'

import { updateTag } from 'next/cache'

import { createAuditLog } from '@/features/audit-logs'
import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function deleteMember(id: string) {
  const { member } = await getSession()

  const result = await pool.query(
    'SELECT firstname, lastname FROM members WHERE id = $1',
    [id]
  )
  const targetName = result.rows[0]
    ? `${result.rows[0].firstname} ${result.rows[0].lastname}`
    : 'Unknown member'

  if (member) {
    await createAuditLog({
      memberId: member.id,
      action: 'Delete',
      entityId: id,
      entityType: 'member',
      description: `Member ${targetName} deleted`,
    })
  }

  await pool.query('DELETE FROM members WHERE id = $1', [id])
  updateTag('members')
}
