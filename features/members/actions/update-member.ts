'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

import { memberSchema } from '@/features/members/schemas/member'
import { pool } from '@/features/shared/lib/db'

export async function updateMember(
  id: string,
  data: z.infer<typeof memberSchema>
) {
  const {
    firstname,
    lastname,
    middlename,
    email,
    phone,
    address,
    birthdate,
    isTrainer,
  } = data

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

    // Handle Trainer status
    if (isTrainer) {
      // Insert into trainers if not exists
      await client.query(
        `INSERT INTO gym_manager.trainers (member_id) VALUES ($1) ON CONFLICT (member_id) DO NOTHING`,
        [id]
      )
    } else {
      // Remove from trainers if exists
      await client.query(
        `DELETE FROM gym_manager.trainers WHERE member_id = $1`,
        [id]
      )
    }

    await client.query('COMMIT')
    updateTag('/members')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
