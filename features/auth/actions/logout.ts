'use server'

import { cookies } from 'next/headers'

import { createAuditLog } from '@/features/audit-logs'
import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function logout() {
  const session = await getSession()
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session')?.value

  if (sessionId) {
    try {
      await pool.query('DELETE FROM sessions WHERE id = $1', [sessionId])

      // Create audit log
      if (session.authenticated && session.member) {
        await createAuditLog({
          memberId: session.member.id,
          entityId: sessionId,
          entityType: 'session',
          action: 'DELETE',
          description: `User logged out`,
        }).catch((error) => console.error('Failed to create audit log:', error))
      }
    } catch (error) {
      console.error('Error removing session:', error)
    }
  }

  cookieStore.delete('session')
}
