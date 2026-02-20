'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

import { getSession } from '@/features/auth'
import { planDetailsSchema } from '@/features/plans/schemas/plan-details'
import { pool } from '@/features/shared/lib/db'
import { PG_UNIQUE_VIOLATION } from '@/features/shared/lib/postgres-errors'

export async function createPlan(
  data: z.infer<typeof planDetailsSchema>
): Promise<{
  success: boolean
  message: string
  errorType?: 'AUTH' | 'NAME_COLLISION' | 'VALIDATION' | 'UNKNOWN'
}> {
  try {
    const validated = planDetailsSchema.parse(data)
    const { member } = await getSession()

    if (!member) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Unauthorized. Please log in to create a plan.',
      }
    }

    if (!member.isTrainer) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Only trainers can create plans.',
      }
    }

    await pool.query(
      `WITH inserted_plan AS (
          INSERT INTO plans (name, price, min_duration_months, description)
              VALUES ($1, $2, $3, $4)
              RETURNING id, name
      )
       INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
       SELECT $5, 'Create'::action_type, id, 'plan', 'Plan created: ' || name
       FROM inserted_plan`,
      [
        validated.name,
        validated.price,
        validated.minDurationMonths,
        validated.description ?? null,
        member.id,
      ]
    )

    updateTag('plans')
    updateTag('members')

    return {
      success: true,
      message: 'Plan created successfully.',
    }
  } catch (error: unknown) {
    if (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === PG_UNIQUE_VIOLATION
    ) {
      return {
        success: false,
        errorType: 'NAME_COLLISION',
        message: 'A plan with this name already exists.',
      }
    }
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errorType: 'VALIDATION',
        message: 'Invalid input data. Please check the form and try again.',
      }
    }
    console.error('[CREATE_PLAN_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An unexpected error occurred. Please try again later.',
    }
  }
}
