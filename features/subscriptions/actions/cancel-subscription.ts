'use server'

import { endOfMonth } from 'date-fns'
import { updateTag } from 'next/cache'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function cancelSubscription(
  subscriptionId: string
): Promise<void> {
  const session = await getSession()
  if (!session.authenticated || !session.member) {
    throw new Error('Unauthorized')
  }

  const memberId = session.member.id

  // Get subscription details
  const subQuery = `
    SELECT s.id, s.member_id, s.start_date, s.end_date, p.min_duration_months
    FROM subscriptions s
    JOIN plans p ON s.plan_id = p.id
    WHERE s.id = $1 AND s.member_id = $2
  `

  const subResult = await pool.query(subQuery, [subscriptionId, memberId])

  if (subResult.rows.length === 0) {
    throw new Error('Subscription not found')
  }

  const subscription = subResult.rows[0]

  if (subscription.end_date) {
    throw new Error('Subscription is already cancelled')
  }

  const startDate = new Date(subscription.start_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Future subscriptions can always be cancelled immediately (deleted)
  if (startDate > today) {
    const deleteQuery = `
      DELETE FROM subscriptions
      WHERE id = $1 AND member_id = $2
    `
    await pool.query(deleteQuery, [subscriptionId, memberId])
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

    const updateQuery = `
      UPDATE subscriptions
      SET end_date = $1, updated_at = NOW()
      WHERE id = $2 AND member_id = $3
    `

    await pool.query(updateQuery, [endDate, subscriptionId, memberId])
  }

  updateTag('subscriptions')
  updateTag('members')
}
