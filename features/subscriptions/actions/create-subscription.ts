'use server'

import { updateTag } from 'next/cache'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'
import { PG_EXCLUSION_VIOLATION } from '@/features/shared/lib/postgres-errors'

export async function createSubscription(
  planId: string,
  targetMemberId?: string
): Promise<{
  success: boolean
  message: string
  errorType?:
    | 'AUTH'
    | 'NOT_FOUND'
    | 'ALREADY_ACTIVE'
    | 'FUTURE_EXISTS'
    | 'CANCELLED_PENDING'
    | 'UNKNOWN'
}> {
  const client = await pool.connect()
  try {
    const session = await getSession()
    if (!session || !session.member) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Unauthorized. Please log in to create a subscription.',
      }
    }

    let memberId: string
    if (targetMemberId) {
      if (!session.member.isTrainer) {
        return {
          success: false,
          errorType: 'AUTH',
          message: 'Only trainers can create subscriptions for other members',
        }
      }
      memberId = targetMemberId
    } else {
      memberId = session.member.id
    }

    await client.query('BEGIN')

    // Check if plan exists
    const planQuery = await client.query(
      `
      SELECT id, name, min_duration_months
      FROM plans 
      WHERE id = $1
    `,
      [planId]
    )

    if (planQuery.rows.length === 0) {
      await client.query('ROLLBACK')
      return {
        success: false,
        errorType: 'NOT_FOUND',
        message: 'Plan not found.',
      }
    }

    const planName = planQuery.rows[0].name

    // Check for active subscription
    const activeSubQuery = await client.query(
      `
      SELECT id 
      FROM subscriptions
      WHERE member_id = $1 AND end_date IS NULL
    `,
      [memberId]
    )

    if (activeSubQuery.rows.length > 0) {
      await client.query('ROLLBACK')
      return {
        success: false,
        errorType: 'ALREADY_ACTIVE',
        message: 'You already have an active subscription.',
      }
    }

    // Check for future subscription
    const futureSubQuery = await client.query(
      `
      SELECT id 
      FROM subscriptions
      WHERE member_id = $1 AND start_date > CURRENT_DATE
    `,
      [memberId]
    )

    if (futureSubQuery.rows.length > 0) {
      await client.query('ROLLBACK')
      return {
        success: false,
        errorType: 'FUTURE_EXISTS',
        message: 'You already have a future subscription scheduled.',
      }
    }

    // Check for cancelled subscription that hasn't ended yet
    const cancelledSubQuery = await client.query(
      `
      SELECT s.id, s.end_date, m.firstname, m.lastname
      FROM subscriptions s
      JOIN members m ON s.member_id = m.id
      WHERE s.member_id = $1 
        AND end_date IS NOT NULL 
        AND end_date >= CURRENT_DATE
      ORDER BY end_date DESC
      LIMIT 1
    `,
      [memberId]
    )

    let startDate: Date
    let memberName: string

    if (cancelledSubQuery.rows.length > 0) {
      // Start the day after the cancelled subscription ends
      const cancelledEndDate = new Date(cancelledSubQuery.rows[0].end_date)
      startDate = new Date(cancelledEndDate)
      startDate.setDate(startDate.getDate() + 1)
      memberName = `${cancelledSubQuery.rows[0].firstname} ${cancelledSubQuery.rows[0].lastname}`
    } else {
      // Start immediately
      startDate = new Date()
      startDate.setHours(0, 0, 0, 0)

      // Get member name
      const memberQuery = await client.query(
        `
        SELECT firstname, lastname 
        FROM members 
        WHERE id = $1
      `,
        [memberId]
      )

      memberName =
        memberQuery.rows.length > 0
          ? `${memberQuery.rows[0].firstname} ${memberQuery.rows[0].lastname}`
          : 'Unknown'
    }

    // Create new subscription
    let createDescription: string
    if (memberId === session.member.id) {
      createDescription = `Subscription to ${planName} created`
    } else {
      createDescription = `Subscription to ${planName} created for ${memberName}`
    }

    const insertQuery = await client.query(
      `
      WITH new_sub AS (
        INSERT INTO subscriptions (member_id, plan_id, start_date)
        VALUES ($1, $2, $3)
        RETURNING id
      ),
      log_sub AS (
        INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
        SELECT $4, 'Create'::action_type, id, 'subscription', $5
        FROM new_sub
      )
      SELECT id FROM new_sub
    `,
      [memberId, planId, startDate, session.member.id, createDescription]
    )

    if (insertQuery.rowCount === 0) {
      await client.query('ROLLBACK')
      return {
        success: false,
        errorType: 'UNKNOWN',
        message: 'Failed to create subscription.',
      }
    }

    await client.query('COMMIT')

    updateTag('subscriptions')

    return {
      success: true,
      message: 'Subscription created successfully.',
    }
  } catch (error: unknown) {
    if (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === PG_EXCLUSION_VIOLATION
    ) {
      await client.query('ROLLBACK').catch(() => {})
      return {
        success: false,
        errorType: 'ALREADY_ACTIVE',
        message: 'You already have an active subscription during this period.',
      }
    }
    await client.query('ROLLBACK').catch(() => {})
    console.error('[CREATE_SUBSCRIPTION_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An error occurred while creating the subscription.',
    }
  } finally {
    client.release()
  }
}
