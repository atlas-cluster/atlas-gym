'use server'

import { updateTag } from 'next/cache'

import { createAuditLog } from '@/features/audit-logs'
import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function deleteMembers(ids: string[]) {
  const { member } = await getSession()

  if (member) {
    const result = await pool.query(
      'SELECT id, firstname, lastname FROM members WHERE id = ANY($1)',
      [ids]
    )
    const membersMap = new Map(
      result.rows.map((row) => [row.id, `${row.firstname} ${row.lastname}`])
    )

    await Promise.all(
      ids.map((id) => {
        const name = membersMap.get(id) || 'Unknown member'
        return createAuditLog({
          memberId: member.id,
          action: 'Delete',
          entityId: id,
          entityType: 'member',
          description: `Member ${name} deleted`,
        })
      })
    )
  }

  await pool.query('DELETE FROM members WHERE id = ANY($1)', [ids])
  updateTag('members')
}
