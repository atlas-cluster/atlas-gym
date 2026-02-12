'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

import { planDetailsSchema } from '@/features/plans/schemas/plan-details'
import { pool } from '@/features/shared/lib/db'

export async function createPlan(data: z.infer<typeof planDetailsSchema>) {
  const validated = planDetailsSchema.parse(data)

  await pool.query(
    `INSERT INTO plans (name, price, min_duration_months, description)
     VALUES ($1, $2, $3, $4)`,
    [
      validated.name,
      validated.price,
      validated.minDurationMonths,
      validated.description || null,
    ]
  )

  updateTag('plans')
  updateTag('members') // Invalidate members cache for plan filter options
}
