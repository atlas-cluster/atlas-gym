'use server'

import { updateTag } from 'next/cache'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'
import {
  PG_EXCLUSION_VIOLATION,
  PG_FOREIGN_KEY_VIOLATION,
} from '@/features/shared/lib/postgres-errors'

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

    const isSelf = memberId === session.member.id

    const result = await pool.query(
      `
      WITH locked_plan AS (
        SELECT id, name
        FROM plans
        WHERE id = $1
        FOR UPDATE
      ),
      member_info AS (
        SELECT id, firstname, lastname
        FROM members
        WHERE id = $2
      ),
      active_sub AS (
        SELECT id
        FROM subscriptions
        WHERE member_id = $2 AND end_date IS NULL
        FOR UPDATE
      ),
      future_sub AS (
        SELECT id
        FROM subscriptions
        WHERE member_id = $2 AND start_date > CURRENT_DATE
        FOR UPDATE
      ),
      cancelled_sub AS (
        SELECT s.end_date
        FROM subscriptions s
        WHERE s.member_id = $2
          AND s.end_date IS NOT NULL
          AND s.end_date >= CURRENT_DATE
        ORDER BY s.end_date DESC
        LIMIT 1
        FOR UPDATE
      ),
      computed_start AS (
        SELECT CASE
          WHEN (SELECT end_date FROM cancelled_sub) IS NOT NULL
            THEN (SELECT end_date + 1 FROM cancelled_sub)
          ELSE CURRENT_DATE
        END AS start_date
      ),
      pre_checks AS (
        SELECT
          (SELECT COUNT(*) FROM locked_plan) AS plan_exists,
          (SELECT COUNT(*) FROM member_info) AS member_exists,
          (SELECT COUNT(*) FROM active_sub) AS has_active,
          (SELECT COUNT(*) FROM future_sub) AS has_future,
          (SELECT start_date FROM computed_start) AS start_date,
          (SELECT name FROM locked_plan) AS plan_name,
          (SELECT firstname FROM member_info) AS firstname,
          (SELECT lastname FROM member_info) AS lastname
      ),
      new_sub AS (
        INSERT INTO subscriptions (member_id, plan_id, start_date)
        SELECT $2, $1, pc.start_date
        FROM pre_checks pc
        WHERE pc.plan_exists > 0
          AND pc.member_exists > 0
          AND pc.has_active = 0
          AND pc.has_future = 0
        RETURNING id
      ),
      log_sub AS (
        INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
        SELECT
          $3,
          'Create'::action_type,
          ns.id,
          'subscription',
          CASE
            WHEN $4::boolean THEN 'Subscription to ' || pc.plan_name || ' created'
            ELSE 'Subscription to ' || pc.plan_name || ' created for ' || pc.firstname || ' ' || pc.lastname
          END
        FROM new_sub ns, pre_checks pc
      )
      SELECT
        pc.plan_exists,
        pc.member_exists,
        pc.has_active,
        pc.has_future,
        (SELECT COUNT(*) FROM new_sub) AS inserted
      FROM pre_checks pc
      `,
      [planId, memberId, session.member.id, isSelf]
    )

    const row = result.rows[0]

    if (Number(row.plan_exists) === 0) {
      return {
        success: false,
        errorType: 'NOT_FOUND',
        message: 'Plan not found.',
      }
    }

    if (Number(row.member_exists) === 0) {
      return {
        success: false,
        errorType: 'NOT_FOUND',
        message: 'Member not found.',
      }
    }

    if (Number(row.has_active) > 0) {
      return {
        success: false,
        errorType: 'ALREADY_ACTIVE',
        message: 'You already have an active subscription.',
      }
    }

    if (Number(row.has_future) > 0) {
      return {
        success: false,
        errorType: 'FUTURE_EXISTS',
        message: 'You already have a future subscription scheduled.',
      }
    }

    if (Number(row.inserted) === 0) {
      return {
        success: false,
        errorType: 'UNKNOWN',
        message: 'Failed to create subscription.',
      }
    }

    updateTag('subscriptions')

    return {
      success: true,
      message: 'Subscription created successfully.',
    }
  } catch (error: unknown) {
    if (error !== null && typeof error === 'object' && 'code' in error) {
      if (error.code === PG_EXCLUSION_VIOLATION) {
        return {
          success: false,
          errorType: 'ALREADY_ACTIVE',
          message:
            'You already have an active subscription during this period.',
        }
      }
      if (error.code === PG_FOREIGN_KEY_VIOLATION) {
        return {
          success: false,
          errorType: 'NOT_FOUND',
          message: 'Plan or member no longer exists.',
        }
      }
    }
    console.error('[CREATE_SUBSCRIPTION_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An error occurred while creating the subscription.',
    }
  }
}
