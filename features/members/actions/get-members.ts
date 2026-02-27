'use server'

import { unstable_cache } from 'next/cache'

import { getSession } from '@/features/auth'
import { MemberDisplay } from '@/features/members/types'
import { pool } from '@/features/shared/lib/db'
import { SubscriptionDisplay } from '@/features/subscriptions'

type SubscriptionRow = {
  id: string
  planId: string
  name: string
  price: string
  minDurationMonths: number
  description: string | null
  startDate: string
  endDate: string | null
  updatedAt: string
}

const getMembersCached = unstable_cache(
  async (): Promise<MemberDisplay[]> => {
    const result = await pool.query(`
        WITH member_subs AS (
            SELECT
                s.member_id,
                json_agg(
                        json_build_object(
                                'id', s.id,
                                'planId', p.id,
                                'name', p.name,
                                'price', p.price,
                                'minDurationMonths', p.min_duration_months,
                                'description', p.description,
                                'startDate', s.start_date,
                                'endDate', s.end_date,
                                'updatedAt', s.updated_at
                        ) ORDER BY s.start_date ASC
                ) as subscriptions
            FROM subscriptions s
                     JOIN plans p ON s.plan_id = p.id
            WHERE s.start_date > CURRENT_DATE
               OR (s.start_date <= CURRENT_DATE AND (s.end_date IS NULL OR s.end_date >= CURRENT_DATE))
            GROUP BY s.member_id
        )
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
            ms.subscriptions
        FROM members m
                 LEFT JOIN trainers t ON m.id = t.member_id
                 LEFT JOIN member_subs ms ON m.id = ms.member_id
        ORDER BY m.lastname, m.firstname
    `)

    return result.rows.map((row) => {
      const subscriptions = (row.subscriptions || []) as SubscriptionRow[]
      const now = new Date()
      // Normalize today to start of day for comparison matching SQL DATE type
      now.setHours(0, 0, 0, 0)

      let currentSubscription: SubscriptionDisplay | undefined
      let futureSubscription: SubscriptionDisplay | undefined

      // Subscriptions are ordered by start_date ASC from the query now.
      // We iterate to find the active one and the *first* future one.
      for (const sub of subscriptions) {
        const startDate = new Date(sub.startDate)
        const endDate = sub.endDate ? new Date(sub.endDate) : undefined

        // Normalize comparison dates
        // Note: Dates coming from JSON might be strings like "2023-01-01" or ISO.
        startDate.setHours(0, 0, 0, 0)
        if (endDate) endDate.setHours(0, 0, 0, 0)

        const isFuture = startDate > now
        const isActive = startDate <= now && (!endDate || endDate >= now)
        const isCancelled = !!(startDate <= now && endDate && endDate >= now)

        const subDisplay: SubscriptionDisplay = {
          id: sub.id,
          planId: sub.planId,
          name: sub.name,
          price: parseFloat(sub.price),
          minDurationMonths: sub.minDurationMonths,
          description: sub.description || undefined,
          updatedAt: new Date(sub.updatedAt),
          startDate: startDate,
          endDate: endDate,
          isActive,
          isFuture,
          isCancelled,
        }

        if (isFuture) {
          // Since we order ASC, the first future subscription we find is the nearest one.
          // We only assign if we haven't found one yet.
          if (!futureSubscription) {
            futureSubscription = subDisplay
          }
        } else if (isActive) {
          // Usually there's only one active sub, but if overlaps exist, this takes the last one (latest start date)
          // because ASC order puts later starts at the end.
          currentSubscription = subDisplay
        }
      }

      return {
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
        currentSubscription,
        futureSubscription,
      }
    })
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
