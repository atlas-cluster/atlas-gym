'use server'

import { updateTag } from 'next/cache'

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
  const planQuery = `SELECT id FROM plans WHERE id = $1`
  const planResult = await pool.query(planQuery, [planId])

  if (planResult.rows.length === 0) {
    throw new Error('Plan not found')
  }

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
  `

  await pool.query(insertQuery, [memberId, planId, startDate])

  updateTag('subscriptions')
  updateTag('members')

  // Create audit log
  const { createAuditLog } = await import('@/features/audit-logs')

  // Get plan name for better description
  const planNameResult = await pool.query(
    'SELECT name FROM plans WHERE id = $1',
    [planId]
  )
  const planName = planNameResult.rows[0]?.name || 'Unknown plan'

  await createAuditLog({
    memberId: session.member.id,
    entityId: planId,
    entityType: 'subscription',
    action: 'CREATE',
    description: targetMemberId
      ? `Created subscription to "${planName}" for member`
      : `Subscribed to "${planName}"`,
  }).catch((error) => console.error('Failed to create audit log:', error))
}
