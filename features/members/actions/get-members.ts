'use server'

import { unstable_cache } from 'next/cache'

import { MemberDisplay } from '@/features/members/types'
import { pool } from '@/features/shared/lib/db'

const getMembersCached = unstable_cache(
  async (): Promise<MemberDisplay[]> => {
    const query = `
      SELECT m.id,
             m.email,
             m.created_at,
             m.firstname,
             m.lastname,
             m.middlename,
             m.address,
             m.birthdate,
             m.phone,
             m.payment_type as "paymentType",
             CASE WHEN t.member_id IS NOT NULL THEN true ELSE false END as "isTrainer",
             -- Current/cancelled subscription
             current_p.name as "planName",
             current_s.end_date as "subscriptionEndDate",
             -- Future subscription
             future_p.name as "futureSubscriptionName",
             future_s.start_date as "futureSubscriptionStartDate"
      FROM members m
             LEFT JOIN trainers t ON m.id = t.member_id
             -- Current or cancelled subscription (where end_date is NULL or in the future)
             LEFT JOIN LATERAL (
               SELECT * FROM subscriptions 
               WHERE member_id = m.id 
                 AND (end_date IS NULL OR end_date >= CURRENT_DATE)
                 AND start_date <= CURRENT_DATE
               ORDER BY start_date DESC
               LIMIT 1
             ) current_s ON true
             LEFT JOIN plans current_p ON current_s.plan_id = current_p.id
             -- Future subscription (where start_date is in the future)
             LEFT JOIN LATERAL (
               SELECT * FROM subscriptions 
               WHERE member_id = m.id 
                 AND start_date > CURRENT_DATE
               ORDER BY start_date ASC
               LIMIT 1
             ) future_s ON true
             LEFT JOIN plans future_p ON future_s.plan_id = future_p.id
      ORDER BY m.lastname, m.firstname
    `

    const result = await pool.query(query)
    return result.rows
  },
  ['members-list'],
  { revalidate: 3600, tags: ['members'] }
)

export async function getMembers(): Promise<MemberDisplay[]> {
  return getMembersCached()
}
