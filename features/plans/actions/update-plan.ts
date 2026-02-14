'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

import { planDetailsSchema } from '@/features/plans/schemas/plan-details'
import { pool } from '@/features/shared/lib/db'

export async function updatePlan(
  id: string,
  data: z.infer<typeof planDetailsSchema>
) {
  const validated = planDetailsSchema.parse(data)

  await pool.query(
    `UPDATE plans 
     SET name = $1, 
         price = $2, 
         min_duration_months = $3, 
         description = $4,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $5`,
    [
      validated.name,
      validated.price,
      validated.minDurationMonths,
      validated.description || null,
      id,
    ]
  )

  updateTag('plans')
  updateTag('members')
}
