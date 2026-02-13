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
             -- Current/Active subscription (started and not ended)
             s.id as "subscriptionId",
             p.name as "planName",
             s.start_date as "subscriptionStartDate",
             s.end_date as "subscriptionEndDate",
             -- Future subscription (not started yet)
             fs.id as "futureSubscriptionId",
             fp.name as "futurePlanName",
             fs.start_date as "futureSubscriptionStartDate"
      FROM members m
             LEFT JOIN trainers t ON m.id = t.member_id
             LEFT JOIN subscriptions s ON m.id = s.member_id 
               AND s.start_date <= CURRENT_DATE 
               AND (s.end_date IS NULL OR s.end_date >= CURRENT_DATE)
             LEFT JOIN plans p ON s.plan_id = p.id
             LEFT JOIN subscriptions fs ON m.id = fs.member_id 
               AND fs.start_date > CURRENT_DATE
             LEFT JOIN plans fp ON fs.plan_id = fp.id
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
