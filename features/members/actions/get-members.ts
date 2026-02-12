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
             p.name as "planName"
      FROM members m
             LEFT JOIN trainers t ON m.id = t.member_id
             LEFT JOIN subscriptions s ON m.id = s.member_id AND s.end_date IS NULL
             LEFT JOIN plans p ON s.plan_id = p.id
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
