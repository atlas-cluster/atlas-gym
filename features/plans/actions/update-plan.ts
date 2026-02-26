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
    | 'NOT_FOUND'
    | 'VERSION_MISMATCH'
    | 'NAME_COLLISION'
    | 'VALIDATION'
    | 'UNKNOWN'
}> {
  try {
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

    const validated = planDetailsSchema.parse(data)

    const result = await pool.query(
      `WITH target_plan AS (
        SELECT id,
               (date_trunc('milliseconds', updated_at) = $6::timestamptz) AS version_match
        FROM plans WHERE id = $5
      ),
      updated_plan AS (
        UPDATE plans
          SET name = $1, price = $2, min_duration_months = $3, description = $4, updated_at = NOW()
          WHERE id = $5
            AND (SELECT version_match FROM target_plan) = true
          RETURNING id, name
      ),
      log_plan AS (
        INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
        SELECT $7, 'Update'::action_type, id, 'plan', 'Plan ' || name || ' updated'
        FROM updated_plan
      )
      SELECT
        (SELECT COUNT(*) FROM target_plan) AS found,
        (SELECT version_match FROM target_plan) AS version_match,
        (SELECT id FROM updated_plan) AS updated_id`,
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

    const row = result.rows[0]

    if (parseInt(row.found) === 0) {
      return {
        success: false,
        errorType: 'NOT_FOUND',
        message: 'Plan not found.',
      }
    }

    if (!row.version_match) {
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
