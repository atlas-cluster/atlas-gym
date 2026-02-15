'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

import { createAuditLog } from '@/features/audit-logs'
import { getSession } from '@/features/auth'
import { memberDetailsSchema } from '@/features/members/schemas/member-details'
import { pool } from '@/features/shared/lib/db'

export async function updateMember(
  id: string,
  data: z.infer<typeof memberDetailsSchema>
) {
  const { firstname, lastname, middlename, email, phone, address, birthdate } =
    data

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Update Member details
    await client.query(
      `UPDATE members
       SET firstname = $1, lastname = $2, middlename = $3, email = $4, phone = $5, address = $6, birthdate = $7
       WHERE id = $8`,
      [firstname, lastname, middlename, email, phone, address, birthdate, id]
    )

    // Create audit log
    const session = await getSession()
    if (session.authenticated && session.member) {
      await createAuditLog({
        memberId: session.member.id,
        entityId: id,
        entityType: 'member',
        action: 'UPDATE',
        description: `Updated member details: ${firstname} ${lastname}`,
      })
    }

    await client.query('COMMIT')
    updateTag('members')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
