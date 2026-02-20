'use server'

import { endOfMonth } from 'date-fns'
import { updateTag } from 'next/cache'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function cancelSubscription(
  subscriptionId: string,
  lastUpdatedAt: string,
  targetMemberId?: string
): Promise<{
  success: boolean
  message: string
  errorType?:
    | 'AUTH'
    | 'NOT_FOUND'
    | 'ALREADY_CANCELLED'
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
      SELECT s.id, s.member_id, s.start_date, s.end_date, p.min_duration_months, p.name as plan_name, m.firstname, m.lastname, s.updated_at
      FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      JOIN members m ON s.member_id = m.id
      WHERE s.id = $1 AND s.member_id = $2
    `,
      [subscriptionId, memberId]
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
      const deleteQuery = await client.query(
        `
        WITH deleted_sub AS (
          DELETE FROM subscriptions
          WHERE id = $1 AND member_id = $2 AND updated_at = $4
          RETURNING id
        ),
        log_sub AS (
          INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
          SELECT $3, 'Delete'::action_type, id, 'subscription',
                'Future subscription to ${planName} deleted for ${memberName} by ${session.member.firstname} ${session.member.lastname}'
          FROM deleted_sub
        )
      `,
        [subscriptionId, memberId, session.member.id, lastUpdatedAt]
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
      // For active subscriptions, calculate end date
      // End date is the later of: end of current month OR end of minimum duration
      const endOfCurrentMonth = endOfMonth(today)

      // Calculate minimum duration end date
      // Example: started Jan 13 + 6 months = Jul 13
      // Then get the last day of the month before that (Jun 30)
      // This ensures the subscription runs for the full minimum number of months
      const minDurationDate = new Date(startDate)
      minDurationDate.setMonth(
        minDurationDate.getMonth() + subscription.min_duration_months
      )

      // Get the last day of the month BEFORE the calculated date
      // E.g., if minDurationDate is Jul 13, we want Jun 30
      const lastMonthStart = new Date(
        minDurationDate.getFullYear(),
        minDurationDate.getMonth() - 1,
        1
      )
      const minDurationEndDate = endOfMonth(lastMonthStart)

      // Use whichever is later
      const endDate =
        endOfCurrentMonth > minDurationEndDate
          ? endOfCurrentMonth
          : minDurationEndDate

      const updateQuery = await client.query(
        `
        WITH updated_sub AS (
          UPDATE subscriptions
          SET end_date = $1, updated_at = NOW()
          WHERE id = $2 AND member_id = $3
          RETURNING id
        ),
        log_sub AS (
          INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
          SELECT $4, 'Update'::action_type, id, 'subscription',
                'Subscription to ${planName} cancelled for ${memberName} by ${session.member.firstname} ${session.member.lastname}'
          FROM updated_sub
        )
      `,
        [endDate, subscriptionId, memberId, session.member.id]
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
      message: 'An error occurred while deleting the plan.',
    }
  } finally {
    client.release()
  }
}
