'use server'

import { unstable_cache } from 'next/cache'

import { getSession } from '@/features/auth'
import { MemberDisplay } from '@/features/members/types'
import { pool } from '@/features/shared/lib/db'
import { SubscriptionDisplay } from '@/features/subscriptions'

const getMembersCached = unstable_cache(
  async (): Promise<MemberDisplay[]> => {
    const result = await pool.query(`
        SELECT
            m.id,
            m.email,
            m.firstname,
            m.lastname,
            m.middlename,
            m.address,
            m.birthdate,
            m.phone,
            m.payment_type as "paymentType",
            m.created_at as "createdAt",
            m.updated_at as "updatedAt",
            CASE WHEN t.member_id IS NOT NULL THEN true ELSE false END as "isTrainer",
            s.id as subscription_id,
            s.plan_id as "planId",
            p.name as "planName",
            p.price as "planPrice",
            p.min_duration_months as "planMinDurationMonths",
            p.description as "planDescription",
            s.start_date as "startDate",
            s.end_date as "endDate",
            s.updated_at as "subUpdatedAt",
            CASE
                WHEN s.start_date <= CURRENT_DATE AND (s.end_date IS NULL OR s.end_date >= CURRENT_DATE) THEN true
                ELSE false
            END as "isActive",
            CASE
                WHEN s.start_date > CURRENT_DATE THEN true
                ELSE false
            END as "isFuture",
             CASE
                WHEN s.start_date <= CURRENT_DATE AND s.end_date IS NOT NULL AND s.end_date >= CURRENT_DATE THEN true
                ELSE false
            END as "isCancelled"
        FROM members m
                 LEFT JOIN trainers t ON m.id = t.member_id
                 LEFT JOIN subscriptions s ON m.id = s.member_id
                 LEFT JOIN plans p ON s.plan_id = p.id
        WHERE (s.start_date > CURRENT_DATE
           OR (s.start_date <= CURRENT_DATE AND (s.end_date IS NULL OR s.end_date >= CURRENT_DATE)))
           OR s.id IS NULL
        ORDER BY m.lastname, m.firstname, s.start_date ASC
    `)

    const membersMap = new Map<string, MemberDisplay>()

    for (const row of result.rows) {
      if (!membersMap.has(row.id)) {
        membersMap.set(row.id, {
          id: row.id,
          email: row.email,
          createdAt: new Date(row.createdAt),
          updatedAt: new Date(row.updatedAt),
          firstname: row.firstname,
          lastname: row.lastname,
          middlename: row.middlename || undefined,
          address: row.address || undefined,
          birthdate: new Date(row.birthdate),
          phone: row.phone || undefined,
          paymentType: row.paymentType || undefined,
          isTrainer: row.isTrainer,
          currentSubscription: undefined,
          futureSubscription: undefined,
        })
      }

      const member = membersMap.get(row.id)!

      if (row.subscription_id) {
        const subDisplay: SubscriptionDisplay = {
          id: row.subscription_id,
          planId: row.planId,
          name: row.planName,
          price: parseFloat(row.planPrice),
          minDurationMonths: row.planMinDurationMonths,
          description: row.planDescription || undefined,
          updatedAt: new Date(row.subUpdatedAt),
          startDate: new Date(row.startDate),
          endDate: row.endDate ? new Date(row.endDate) : undefined,
          isActive: row.isActive,
          isFuture: row.isFuture,
          isCancelled: row.isCancelled,
        }

        if (subDisplay.isFuture && !member.futureSubscription) {
          member.futureSubscription = subDisplay
        } else if (subDisplay.isActive) {
          member.currentSubscription = subDisplay
        }
      }
    }

    return Array.from(membersMap.values())
  },
  ['get-members'],
  { revalidate: 3600, tags: ['members', 'subscriptions', 'plans'] }
)

export async function getMembers(): Promise<MemberDisplay[]> {
  const { member } = await getSession()

  if (!member || !member.isTrainer) {
    return []
  }

  return getMembersCached()
}
