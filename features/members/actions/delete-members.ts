'use server'

import { updateTag } from 'next/cache'

import { createAuditLog } from '@/features/audit-logs'
import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function deleteMembers(ids: string[]) {
  const session = await getSession()
  
  await pool.query('DELETE FROM members WHERE id = ANY($1)', [ids])
  updateTag('members')
  
  // Create audit log
  if (session.authenticated && session.member) {
    await createAuditLog({
      memberId: session.member.id,
      entityId: ids[0], // Use first ID as reference
      entityType: 'member',
      action: 'DELETE',
      description: `Deleted ${ids.length} member(s)`,
    }).catch((error) => console.error('Failed to create audit log:', error))
  }
}
