'use server'

import { cookies } from 'next/headers'

import { createAuditLog } from '@/features/audit-logs'
import { pool } from '@/features/shared/lib/db'

export async function logout() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session')?.value

  if (sessionId) {
    try {
      const result = await pool.query<{ member_id: string }>(
        'DELETE FROM sessions WHERE id = $1 RETURNING member_id',
        [sessionId]
      )

      if (result.rows.length > 0) {
        await createAuditLog({
          memberId: result.rows[0].member_id,
          action: 'DELETE',
          entityId: sessionId,
          entityType: 'session',
          description: 'Member logged out',
        })
      }
    } catch (error) {
      console.error('Error removing session:', error)
    }
  }

  cookieStore.delete('session')
}
