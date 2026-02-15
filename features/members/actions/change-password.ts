'use server'

import bcrypt from 'bcryptjs'
import { z } from 'zod'

import { changePasswordSchema } from '@/features/members/schemas/change-password'
import { pool } from '@/features/shared/lib/db'

export async function changePassword(
  id: string,
  data: z.infer<typeof changePasswordSchema>
) {
  const result = changePasswordSchema.safeParse(data)

  if (!result.success) {
    return { error: 'Invalid data' }
  }

  const { password } = result.data

  const hashedPassword = await bcrypt.hash(password, 10)

  const client = await pool.connect()

  try {
    await client.query('UPDATE members SET password_hash = $1 WHERE id = $2', [
      hashedPassword,
      id,
    ])
  } catch (error) {
    console.error('Failed to change password:', error)
    throw new Error('Failed to change password')
  } finally {
    client.release()
  }

  // Create audit log
  const { createAuditLog } = await import('@/features/audit-logs')
  const { getSession } = await import('@/features/auth')
  const session = await getSession()

  if (session.authenticated && session.member) {
    await createAuditLog({
      memberId: session.member.id,
      entityId: id,
      entityType: 'member',
      action: 'UPDATE',
      description: `Changed password for member`,
    }).catch((error) => console.error('Failed to create audit log:', error))
  }
}
