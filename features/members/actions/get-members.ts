'use server'

import { unstable_cache } from 'next/cache'

import { MemberDisplay } from '@/features/members/types'
import { pool } from '@/features/shared/lib/db'

const getMembersCached = unstable_cache(
  async (): Promise<MemberDisplay[]> => {
    const query = `
    SELECT
      m.id,
      m.email,
      m.created_at,
      m.firstname,
      m.lastname,
      m.middlename,
      m.address,
      m.birthdate,
      m.phone,
      pm.type as "paymentType",
      CASE WHEN t.id IS NOT NULL THEN true ELSE false END as "isTrainer"
    FROM gym_manager.members m
    LEFT JOIN gym_manager.trainers t ON m.id = t.member_id
    LEFT JOIN LATERAL (
      SELECT type
      FROM gym_manager.payment_methods pm
      WHERE pm.member_id = m.id
      ORDER BY pm.updated_at DESC
      LIMIT 1
    ) pm ON true
    ORDER BY m.lastname ASC, m.firstname ASC
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
