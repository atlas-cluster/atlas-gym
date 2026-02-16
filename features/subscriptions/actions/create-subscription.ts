'use server'

import { updateTag } from 'next/cache'

import { createAuditLog } from '@/features/audit-logs'
import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function createSubscription(
  planId: string,
  targetMemberId?: string
): Promise<void> {
  const session = await getSession()
  if (!session.authenticated || !session.member) {
    throw new Error('Unauthorized')
  }

  // If targetMemberId is provided, verify the user is a trainer
  let memberId: string
  if (targetMemberId) {
    if (!session.member.isTrainer) {
      throw new Error(
        'Only trainers can create subscriptions for other members'
      )
    }
    memberId = targetMemberId
  } else {
    memberId = session.member.id
  }

  // Check if plan exists
  const planQuery = `SELECT id, name FROM plans WHERE id = $1`
  const planResult = await pool.query(planQuery, [planId])

  if (planResult.rows.length === 0) {
    throw new Error('Plan not found')
  }
  const planName = planResult.rows[0].name

  // Check for active subscription
  const activeSubQuery = `
    SELECT id FROM subscriptions
    WHERE member_id = $1 AND end_date IS NULL
  `
  const activeSubResult = await pool.query(activeSubQuery, [memberId])

  if (activeSubResult.rows.length > 0) {
    throw new Error('You already have an active subscription')
  }

  // Check for future subscription
  const futureSubQuery = `
    SELECT id FROM subscriptions
    WHERE member_id = $1 AND start_date > CURRENT_DATE
  `
  const futureSubResult = await pool.query(futureSubQuery, [memberId])

  if (futureSubResult.rows.length > 0) {
    throw new Error('You already have a future subscription scheduled')
  }

  // Check for cancelled subscription that hasn't ended yet
  const cancelledSubQuery = `
    SELECT id, end_date FROM subscriptions
    WHERE member_id = $1 
      AND end_date IS NOT NULL 
      AND end_date >= CURRENT_DATE
    ORDER BY end_date DESC
    LIMIT 1
  `
  const cancelledSubResult = await pool.query(cancelledSubQuery, [memberId])

  let startDate: Date | string
  if (cancelledSubResult.rows.length > 0) {
    // Start the day after the cancelled subscription ends
    const cancelledEndDate = new Date(cancelledSubResult.rows[0].end_date)
    startDate = new Date(cancelledEndDate)
    startDate.setDate(startDate.getDate() + 1)
  } else {
    // Start immediately
    startDate = new Date()
    startDate.setHours(0, 0, 0, 0)
  }

  // Create new subscription
  const insertQuery = `
    INSERT INTO subscriptions (member_id, plan_id, start_date)
    VALUES ($1, $2, $3)
    RETURNING id
  `

  const result = await pool.query<{ id: string }>(insertQuery, [
    memberId,
    planId,
    startDate,
  ])

  let memberName = 'Unknown'
  if (memberId === session.member.id) {
    memberName = `${session.member.firstname} ${session.member.lastname}`
  } else {
    const memberRes = await pool.query(
      'SELECT firstname, lastname FROM members WHERE id = $1',
      [memberId]
    )
    if (memberRes.rows.length > 0) {
      memberName = `${memberRes.rows[0].firstname} ${memberRes.rows[0].lastname}`
    }
  }

  if (session.member) {
    await createAuditLog({
      memberId: session.member.id,
      action: 'Create',
      entityId: result.rows[0].id,
      entityType: 'subscription',
      description: `Subscription to ${planName} created for ${memberName}`,
    })
  }

  updateTag('subscriptions')
  updateTag('members')
}
