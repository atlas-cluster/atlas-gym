'use server'

import { updateTag } from 'next/cache'

import { createAuditLog } from '@/features/audit-logs'
import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function convertToMember(id: string) {
  const session = await getSession()
  
  // Get member info for audit log
  const memberResult = await pool.query(
    'SELECT firstname, lastname FROM members WHERE id = $1',
    [id]
  )
  const member = memberResult.rows[0]
  
  await pool.query('DELETE FROM trainers WHERE member_id = $1', [id])
  updateTag('members')
  
  // Create audit log
  if (session.authenticated && session.member && member) {
    await createAuditLog({
      memberId: session.member.id,
      entityId: id,
      entityType: 'member',
      action: 'UPDATE',
      description: `Converted ${member.firstname} ${member.lastname} to regular member`,
    }).catch((error) => console.error('Failed to create audit log:', error))
  }
}
