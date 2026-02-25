'use server'

import { updateTag } from 'next/cache'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function deleteSubscription(
  subscriptionId: string,
  targetMemberId: string
): Promise<{
  success: boolean
  message: string
  errorType?: 'AUTH' | 'NOT_FOUND' | 'UNKNOWN'
}> {
  const client = await pool.connect()
  try {
    const session = await getSession()
    if (!session || !session.member) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Unauthorized. Please log in to delete subscriptions.',
      }
    }

    // Verify the user is a trainer (admin)
    if (!session.member.isTrainer) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Only trainers can delete subscriptions.',
      }
    }

    await client.query('BEGIN')

    // Get subscription details before deleting
    const subQuery = await client.query(
      `
      SELECT s.id, s.member_id, s.start_date, s.end_date, p.name as plan_name, m.firstname, m.lastname
      FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      JOIN members m ON s.member_id = m.id
      WHERE s.id = $1 AND s.member_id = $2
    `,
      [subscriptionId, targetMemberId]
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

    // Delete the subscription immediately, no matter the status or runtime
    const deleteDescription = `Subscription to ${planName} forcefully removed by admin for ${memberName}`
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
      SELECT 1
    `,
      [subscriptionId, targetMemberId, session.member.id, deleteDescription]
    )

    if (deleteQuery.rowCount === 0) {
      await client.query('ROLLBACK')
      return {
        success: false,
        errorType: 'NOT_FOUND',
        message: 'Subscription not found or already deleted.',
      }
    }

    await client.query('COMMIT')

    updateTag('subscriptions')
    updateTag('members')

    return {
      success: true,
      message: 'Subscription deleted successfully.',
    }
  } catch (error: unknown) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('[DELETE_SUBSCRIPTION_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An error occurred while deleting the subscription.',
    }
  } finally {
    client.release()
  }
}
