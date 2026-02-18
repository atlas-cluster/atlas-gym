'use server'

import { updateTag } from 'next/cache'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function deletePlan(id: string): Promise<{
  success: boolean
  message: string
  errorType?: 'AUTH' | 'NOT_FOUND' | 'UNKNOWN'
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

    const planDeleteResult = await pool.query(
      `WITH target_plan AS (
         SELECT name FROM plans WHERE id = $1
      ),
      target_subscriptions AS (
         SELECT s.id, m.firstname, m.lastname
         FROM subscriptions s
         JOIN members m ON s.member_id = m.id
         WHERE s.plan_id = $1
      ),
      deleted_plan AS (
         DELETE FROM plans
         WHERE id = $1
         RETURNING id, name
      ),
      log_plan AS (
         INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
         SELECT $2, 'Delete'::action_type, id, 'plan', 'Plan ' || name || ' deleted'
         FROM deleted_plan 
      ),
      log_subs AS (
         INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
         SELECT $2, 'Delete'::action_type, id, 'subscription',
              'Subscription for ' || firstname || ' ' || lastname || ' deleted (cascade) due to deletion of plan ' || (SELECT name FROM target_plan)
         FROM target_subscriptions
      )
      SELECT id FROM deleted_plan`,
      [id, member.id]
    )

    if (planDeleteResult.rowCount === 0) {
      return {
        success: false,
        errorType: 'NOT_FOUND',
        message: 'Plan not found.',
      }
    }

    updateTag('plans')
    updateTag('subscriptions')
    updateTag('members')

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
