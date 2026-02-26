'use server'

import { updateTag } from 'next/cache'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function cancelSubscription(
  subscriptionId: string,
  lastUpdatedAt: Date,
  targetMemberId?: string
): Promise<{
  success: boolean
  message: string
  errorType?:
    | 'AUTH'
    | 'NOT_FOUND'
    | 'ALREADY_CANCELLED'
    | 'VERSION_MISMATCH'
    | 'VALIDATION'
    | 'UNKNOWN'
}> {
  const client = await pool.connect()
  try {
    const session = await getSession()
    if (!session || !session.member) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Unauthorized. Please log in to cancel a subscription.',
      }
    }

    let memberId: string
    if (targetMemberId) {
      if (!session.member.isTrainer) {
        return {
          success: false,
          errorType: 'AUTH',
          message: 'Only trainers can cancel subscriptions for other members',
        }
      }
      memberId = targetMemberId
    } else {
      memberId = session.member.id
    }

    await client.query('BEGIN')

    const subQuery = await client.query(
      `
      SELECT s.id, s.member_id, s.start_date, s.end_date, p.min_duration_months, p.name as plan_name, m.firstname, m.lastname, s.updated_at,
             (date_trunc('milliseconds', s.updated_at) = $3::timestamptz) AS version_match
      FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      JOIN members m ON s.member_id = m.id
      WHERE s.id = $1 AND s.member_id = $2
    `,
      [subscriptionId, memberId, lastUpdatedAt]
    )

    if (subQuery.rows.length === 0) {
      await client.query('ROLLBACK')
      return {
        success: false,
        errorType: 'NOT_FOUND',
        message: 'Subscription not found.',
      }
    }

    const subscription = subQuery.rows[0]
    const memberName = `${subscription.firstname} ${subscription.lastname}`
    const planName = subscription.plan_name

    if (!subscription.version_match) {
      await client.query('ROLLBACK')
      return {
        success: false,
        errorType: 'VERSION_MISMATCH',
        message:
          'Subscription was modified by another user. Please refresh and try again.',
      }
    }

    if (subscription.end_date) {
      await client.query('ROLLBACK')
      return {
        success: false,
        errorType: 'ALREADY_CANCELLED',
        message: 'Subscription is already cancelled.',
      }
    }

    const startDate = new Date(subscription.start_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (startDate > today) {
      const deleteDescription = `Future subscription to ${planName} deleted for ${memberName} by ${session.member.firstname} ${session.member.lastname}`
      const deleteQuery = await client.query(
        `
        WITH deleted_sub AS (
          DELETE FROM subscriptions
          WHERE id = $1 AND member_id = $2
          RETURNING id
        ),
        log_sub AS (
          INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
          SELECT $3, 'Delete'::action_type, id, 'subscription', $4
          FROM deleted_sub
        )
        SELECT id FROM deleted_sub
      `,
        [subscriptionId, memberId, session.member.id, deleteDescription]
      )

      if (deleteQuery.rowCount === 0) {
        await client.query('ROLLBACK')
        return {
          success: false,
          errorType: 'NOT_FOUND',
          message: 'Subscription not found or already cancelled.',
        }
      }
    } else {
      let updateDescription: string
      if (memberId === session.member.id) {
        updateDescription = `Subscription to ${planName} cancelled`
      } else {
        updateDescription = `Subscription to ${planName} cancelled for ${memberName}`
      }

      const updateQuery = await client.query(
        `
        WITH calc_dates AS (
          SELECT
            (date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 day')::date AS end_of_today_month,
            (date_trunc('month', ($5::date + ($6 || ' months')::interval) - interval '1 month') + interval '1 month' - interval '1 day')::date AS min_duration_end_date
        ),
        final_date AS (
          SELECT GREATEST(end_of_today_month, min_duration_end_date) as final_end_date
          FROM calc_dates
        ),
        updated_sub AS (
          UPDATE subscriptions
          SET end_date = (SELECT final_end_date FROM final_date), 
              updated_at = NOW()
          WHERE id = $1 AND member_id = $2
          RETURNING id
        ),
        log_sub AS (
          INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
          SELECT $3, 'Update'::action_type, id, 'subscription', $4
          FROM updated_sub
        )
        SELECT id FROM updated_sub
      `,
        [
          subscriptionId,
          memberId,
          session.member.id,
          updateDescription,
          startDate,
          subscription.min_duration_months,
        ]
      )

      if (updateQuery.rowCount === 0) {
        await client.query('ROLLBACK')
        return {
          success: false,
          errorType: 'NOT_FOUND',
          message: 'Subscription not found or already cancelled.',
        }
      }
    }
    await client.query('COMMIT')

    updateTag('subscriptions')
    updateTag('members')

    return {
      success: true,
      message: 'Subscription cancelled successfully.',
    }
  } catch (error: unknown) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('[CANCEL_SUBSCRIPTION_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An error occurred while cancelling the subscription.',
    }
  } finally {
    client.release()
  }
}
