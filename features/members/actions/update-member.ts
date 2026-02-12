'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

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
      `UPDATE gym_manager.members
       SET firstname = $1, lastname = $2, middlename = $3, email = $4, phone = $5, address = $6, birthdate = $7
       WHERE id = $8`,
      [firstname, lastname, middlename, email, phone, address, birthdate, id]
    )

    await client.query('COMMIT')
    updateTag('members')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
