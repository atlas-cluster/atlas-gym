'use server'

import { updateTag } from 'next/cache'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function deletePlan(
  id: string,
  lastUpdatedAt: Date
): Promise<{
  success: boolean
  message: string
  errorType?: 'AUTH' | 'NOT_FOUND' | 'VERSION_MISMATCH' | 'UNKNOWN'
}> {
  try {
    const { member } = await getSession()

    if (!member) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Unauthorized. Please log in to delete a plan.',
      }
    }

    if (!member.isTrainer) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Only trainers can delete plans.',
      }
    }

    const result = await pool.query(
      `WITH target_plan AS (
         SELECT id, name,
                (date_trunc('milliseconds', updated_at) = $3::timestamptz) AS version_match
         FROM plans WHERE id = $1
      ),
      target_subscriptions AS (
         SELECT s.id, s.start_date, s.end_date, m.firstname, m.lastname
         FROM subscriptions s
         JOIN members m ON s.member_id = m.id
         WHERE s.plan_id = $1
           AND (SELECT version_match FROM target_plan) = true
           AND (
             s.start_date > CURRENT_DATE
             OR (s.start_date <= CURRENT_DATE AND (s.end_date IS NULL OR s.end_date >= CURRENT_DATE))
           )
      ),
      log_subs AS (
         INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
         SELECT $2, 'Delete'::action_type, ts.id, 'subscription',
              CASE
                WHEN ts.start_date > CURRENT_DATE THEN
                  'Future subscription for ' || ts.firstname || ' ' || ts.lastname || ' canceled (cascade) due to deletion of plan ' || (SELECT name FROM target_plan)
                ELSE
                  'Active subscription for ' || ts.firstname || ' ' || ts.lastname || ' removed (cascade) due to deletion of plan ' || (SELECT name FROM target_plan)
              END
         FROM target_subscriptions ts
      ),
      deleted_plan AS (
         DELETE FROM plans
         WHERE id = $1
           AND (SELECT version_match FROM target_plan) = true
         RETURNING id, name
      ),
      log_plan AS (
         INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
         SELECT $2, 'Delete'::action_type, id, 'plan', 'Plan ' || name || ' deleted'
         FROM deleted_plan 
      )
      SELECT
        (SELECT COUNT(*) FROM target_plan) AS found,
        (SELECT version_match FROM target_plan) AS version_match,
        (SELECT id FROM deleted_plan) AS deleted_id`,
      [id, member.id, lastUpdatedAt]
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

    return {
      success: true,
      message: 'Plan and associated subscriptions deleted successfully.',
    }
  } catch (error: unknown) {
    console.error('[DELETE_PLAN_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An error occurred while deleting the plan.',
    }
  }
}
