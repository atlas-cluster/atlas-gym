'use server'

import { addMonths, endOfMonth, isAfter, isPast } from 'date-fns'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'
import { MemberSubscriptionDisplay } from '@/features/subscriptions/types'

export async function getMemberSubscriptions(): Promise<
  MemberSubscriptionDisplay[]
> {
  const session = await getSession()
  if (!session.authenticated || !session.member) {
    throw new Error('Unauthorized')
  }

  const memberId = session.member.id

  const query = `
    SELECT 
      s.id,
      s.member_id as "memberId",
      s.plan_id as "planId",
      s.start_date as "startDate",
      s.end_date as "endDate",
      s.created_at as "createdAt",
      s.updated_at as "updatedAt",
      p.name as "planName",
      p.price as "planPrice",
      p.min_duration_months as "planMinDurationMonths",
      p.description as "planDescription"
    FROM subscriptions s
    JOIN plans p ON s.plan_id = p.id
    WHERE s.member_id = $1
    ORDER BY 
      CASE 
        WHEN s.end_date IS NULL THEN 0
        WHEN s.start_date > CURRENT_DATE THEN 1
        ELSE 2
      END,
      s.start_date DESC
  `

  const result = await pool.query(query, [memberId])

  return result.rows.map((row): MemberSubscriptionDisplay => {
    const startDate = new Date(row.startDate)
    const endDate = row.endDate ? new Date(row.endDate) : undefined
    const createdAt = new Date(row.createdAt)
    const updatedAt = new Date(row.updatedAt)
    const minEndDate = endOfMonth(
      addMonths(startDate, row.planMinDurationMonths - 1)
    )

    let status: 'active' | 'cancelled' | 'ended' | 'future'
    let canCancel = false
    let canChooseNew = false

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const isFutureStart = isAfter(startDate, today)

    if (isFutureStart) {
      // Future subscription
      status = 'future'
      canCancel = true // Future subscriptions can always be cancelled
      canChooseNew = false
    } else if (!endDate) {
      // Active subscription (no end date)
      status = 'active'
      canCancel = isPast(minEndDate)
      canChooseNew = false
    } else if (isPast(endDate)) {
      // Ended subscription
      status = 'ended'
      canCancel = false
      canChooseNew = true
    } else {
      // Cancelled subscription (has end date in the future)
      status = 'cancelled'
      canCancel = false
      canChooseNew = true // Can choose a future subscription
    }

    return {
      id: row.id,
      memberId: row.memberId,
      planId: row.planId,
      planName: row.planName,
      planPrice: parseFloat(row.planPrice),
      planMinDurationMonths: row.planMinDurationMonths,
      planDescription: row.planDescription,
      startDate,
      endDate,
      createdAt,
      updatedAt,
      status,
      canCancel,
      canChooseNew,
    }
  })
}
