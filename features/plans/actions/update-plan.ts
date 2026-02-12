'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

import { planDetailsSchema } from '@/features/plans/schemas/plan-details'
import { pool } from '@/features/shared/lib/db'

export async function updatePlan(
  id: number,
  data: z.infer<typeof planDetailsSchema>
) {
  const validated = planDetailsSchema.parse(data)

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // If this plan is set as default, unset other defaults
    if (validated.isDefault) {
      await client.query(
        'UPDATE plans SET is_default = false WHERE is_default = true AND id != $1',
        [id]
      )
    }

    await client.query(
      `UPDATE plans 
       SET name = $1, 
           price = $2, 
           min_duration_months = $3, 
           description = $4, 
           is_default = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [
        validated.name,
        validated.price,
        validated.minDurationMonths,
        validated.description || null,
        validated.isDefault,
        id,
      ]
    )

    await client.query('COMMIT')
    updateTag('plans')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
