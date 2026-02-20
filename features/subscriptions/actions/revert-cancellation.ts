'use server'

import { updateTag } from 'next/cache'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function revertCancellation(
  subscriptionId: string,
  targetMemberId?: string
): Promise<{
  success: boolean
  message: string
  errorType?:
    | 'AUTH'
    | 'NOT_FOUND'
    | 'NOT_CANCELLED'
    | 'ALREADY_ENDED'
    | 'UNKNOWN'
}> {
  const client = await pool.connect()
  try {
    const session = await getSession()
    if (!session || !session.member) {
      return {
        success: false,
        errorType: 'AUTH',
        message:
          'Unauthorized. Please log in to revert subscription cancellation.',
      }
    }

    let memberId: string
    if (targetMemberId) {
      if (!session.member.isTrainer) {
        return {
          success: false,
          errorType: 'AUTH',
          message: 'Only trainers can revert cancellations for other members.',
        }
      }
      memberId = targetMemberId
    } else {
      memberId = session.member.id
    }

    await client.query('BEGIN')

    // Get subscription details
    const subQuery = await client.query(
      `
      SELECT s.id, s.member_id, s.start_date, s.end_date, p.name as plan_name, m.firstname, m.lastname
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

    if (!subscription.end_date) {
      await client.query('ROLLBACK')
      return {
        success: false,
        errorType: 'NOT_CANCELLED',
        message: 'Subscription is not cancelled.',
      }
    }

    const endDate = new Date(subscription.end_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (endDate < today) {
      await client.query('ROLLBACK')
      return {
        success: false,
        errorType: 'ALREADY_ENDED',
        message: 'Cannot revert a subscription that has already ended.',
      }
    }

    // Delete any future subscription FIRST (before updating to avoid constraint violation)
    const deleteFutureQuery = await client.query(
      `
      DELETE FROM subscriptions
      WHERE member_id = $1 AND start_date > $2
    `,
      [memberId, subscription.start_date]
    )

    // Now remove the end_date to revert the cancellation
    const updateQuery = await client.query(
      `
      WITH updated_sub AS (
        UPDATE subscriptions
        SET end_date = NULL, updated_at = NOW()
        WHERE id = $1 AND member_id = $2
        RETURNING id
      ),
      log_sub AS (
        INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
        SELECT $3, 'Update'::action_type, id, 'subscription',
              'Cancellation reverted for ${planName} subscription of ${memberName} by ${session.member.firstname} ${session.member.lastname}'
        FROM updated_sub
      )
      SELECT 1
    `,
      [subscriptionId, memberId, session.member.id]
    )

    if (updateQuery.rowCount === 0) {
      await client.query('ROLLBACK')
      return {
        success: false,
        errorType: 'NOT_FOUND',
        message: 'Subscription not found or already modified.',
      }
    }

    await client.query('COMMIT')

    updateTag('subscriptions')
    updateTag('members')

    return {
      success: true,
      message: 'Subscription cancellation reverted successfully.',
    }
  } catch (error: unknown) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('[REVERT_CANCELLATION_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An error occurred while reverting the cancellation.',
    }
  } finally {
    client.release()
  }
}
