'use server'

import bcrypt from 'bcryptjs'
import { z } from 'zod'

import { createAuditLog } from '@/features/audit-logs'
import { getSession } from '@/features/auth'
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
    const res = await client.query(
      'UPDATE members SET password_hash = $1 WHERE id = $2 RETURNING firstname, lastname',
      [hashedPassword, id]
    )
    const updatedMember = res.rows[0]

    const { member } = await getSession()

    if (member && updatedMember) {
      await createAuditLog({
        client,
        memberId: member.id,
        action: 'UPDATE',
        entityId: id,
        entityType: 'member',
        description: `Password changed for ${updatedMember.firstname} ${updatedMember.lastname}`,
      })
    }
  } catch (error) {
    console.error('Failed to change password:', error)
    throw new Error('Failed to change password')
  } finally {
    client.release()
  }
}
