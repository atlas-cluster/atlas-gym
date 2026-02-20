'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

import { getSession } from '@/features/auth'
import { planDetailsSchema } from '@/features/plans/schemas/plan-details'
import { pool } from '@/features/shared/lib/db'
import { PG_UNIQUE_VIOLATION } from '@/features/shared/lib/postgres-errors'

export async function updatePlan(
  id: string,
  data: z.infer<typeof planDetailsSchema>,
  lastUpdatedAt: Date
): Promise<{
  success: boolean
  message: string
  errorType?:
    | 'AUTH'
    | 'VERSION_MISMATCH'
    | 'NAME_COLLISION'
    | 'VALIDATION'
    | 'UNKNOWN'
}> {
  try {
    const validated = planDetailsSchema.parse(data)
    const { member } = await getSession()

    if (!member) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Unauthorized. Please log in to update a plan.',
      }
    }

    if (!member.isTrainer) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Only trainers can update plans.',
      }
    }

    const result = await pool.query(
      `WITH updated_plan AS (
        UPDATE plans
          SET name = $1, price = $2, min_duration_months = $3, description = $4, updated_at = NOW()
          WHERE id = $5 AND date_trunc('milliseconds', updated_at) = $6::timestamptz
          RETURNING id, name
      )
       INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
       SELECT $7, 'Update'::action_type, id, 'plan', 'Plan updated: ' || name
       FROM updated_plan
       RETURNING entity_id`,
      [
        validated.name,
        validated.price,
        validated.minDurationMonths,
        validated.description ?? null,
        id,
        lastUpdatedAt,
        member.id,
      ]
    )

    if (result.rowCount === 0) {
      return {
        success: false,
        errorType: 'VERSION_MISMATCH',
        message:
          'Plan was modified by another user. Please refresh and try again.',
      }
    }

    updateTag('plans')
    updateTag('members')

    return { success: true, message: 'Plan updated successfully.' }
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
    console.error('[UPDATE_PLAN_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An unexpected error occurred.',
    }
  }
}
