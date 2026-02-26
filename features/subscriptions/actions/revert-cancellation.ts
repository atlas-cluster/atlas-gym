'use server'

import { updateTag } from 'next/cache'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function revertCancellation(
  subscriptionId: string,
  lastUpdatedAt: Date,
  hasFutureSubscription: boolean,
  targetMemberId?: string
): Promise<{
  success: boolean
  message: string
  errorType?:
    | 'AUTH'
    | 'NOT_FOUND'
    | 'NOT_CANCELLED'
    | 'ALREADY_ENDED'
    | 'VERSION_MISMATCH'
    | 'FUTURE_SUBSCRIPTION_CONFLICT'
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
      SELECT s.id, s.member_id, s.start_date, s.end_date, s.updated_at, p.name as plan_name, m.firstname, m.lastname
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

    const dbUpdatedAt = new Date(subscription.updated_at).getTime()
    const clientUpdatedAt = new Date(lastUpdatedAt).getTime()
    if (dbUpdatedAt !== clientUpdatedAt) {
      await client.query('ROLLBACK')
      return {
        success: false,
        errorType: 'VERSION_MISMATCH',
        message:
          'Subscription was modified by another user. Please refresh and try again.',
      }
    }

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

    // Check if a future subscription exists that the client doesn't know about
    const futureSubQuery = await client.query(
      `
      SELECT id FROM subscriptions
      WHERE member_id = $1 AND start_date > $2
    `,
      [memberId, subscription.start_date]
    )

    if (futureSubQuery.rows.length > 0 && !hasFutureSubscription) {
      await client.query('ROLLBACK')
      return {
        success: false,
        errorType: 'FUTURE_SUBSCRIPTION_CONFLICT',
        message:
          'A future subscription was added by another user. Please refresh and try again.',
      }
    }

    // Delete any future subscription FIRST (before updating to avoid constraint violation)
    await client.query(
      `
      WITH deleted_future AS (
        DELETE FROM subscriptions
        WHERE member_id = $1 AND start_date > $2
        RETURNING id
      ),
      log_future AS (
        INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
        SELECT $3, 'Delete'::action_type, id, 'subscription', $4
        FROM deleted_future
      )
      SELECT id FROM deleted_future
    `,
      [
        memberId,
        subscription.start_date,
        session.member.id,
        `Future subscription deleted due to cancellation revert for ${memberName} by ${session.member.firstname} ${session.member.lastname}`,
      ]
    )

    // Check for another already-active subscription (no end_date, different id)
    const activeConflictQuery = await client.query(
      `
      SELECT id FROM subscriptions
      WHERE member_id = $1 AND end_date IS NULL AND id <> $2
    `,
      [memberId, subscriptionId]
    )

    if (activeConflictQuery.rows.length > 0) {
      await client.query('ROLLBACK')
      return {
        success: false,
        errorType: 'UNKNOWN',
        message: 'Member already has another active subscription.',
      }
    }

    // Now remove the end_date to revert the cancellation
    const revertDescription = `Cancellation reverted for ${planName} subscription of ${memberName} by ${session.member.firstname} ${session.member.lastname}`
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
        SELECT $3, 'Update'::action_type, id, 'subscription', $4
        FROM updated_sub
      )
      SELECT 1
    `,
      [subscriptionId, memberId, session.member.id, revertDescription]
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
