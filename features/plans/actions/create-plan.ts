'use server'

import { revalidateTag } from 'next/cache'
import { z } from 'zod'

import { planDetailsSchema } from '@/features/plans/schemas/plan-details'
import { pool } from '@/features/shared/lib/db'

export async function createPlan(data: z.infer<typeof planDetailsSchema>) {
  const validated = planDetailsSchema.parse(data)

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // If this plan is set as default, unset other defaults
    if (validated.isDefault) {
      await client.query('UPDATE plans SET is_default = false WHERE is_default = true')
    }

    await client.query(
      `INSERT INTO plans (name, price, min_duration_months, description, is_default)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        validated.name,
        validated.price,
        validated.minDurationMonths,
        validated.description || null,
        validated.isDefault,
      ]
    )

    await client.query('COMMIT')
    revalidateTag('plans')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
