'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

import { createAuditLog } from '@/features/audit-logs'
import { getSession } from '@/features/auth'
import { planDetailsSchema } from '@/features/plans/schemas/plan-details'
import { pool } from '@/features/shared/lib/db'

export async function createPlan(data: z.infer<typeof planDetailsSchema>) {
  const validated = planDetailsSchema.parse(data)
  const session = await getSession()

  const result = await pool.query<{ id: string }>(
    `INSERT INTO plans (name, price, min_duration_months, description)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [
      validated.name,
      validated.price,
      validated.minDurationMonths,
      validated.description || null,
    ]
  )

  updateTag('plans')
  updateTag('members')

  // Create audit log
  if (session.authenticated && session.member) {
    const planId = result.rows[0].id
    await createAuditLog({
      memberId: session.member.id,
      entityId: planId,
      entityType: 'plan',
      action: 'CREATE',
      description: `Created plan "${validated.name}"`,
    }).catch((error) => console.error('Failed to create audit log:', error))
  }
}
