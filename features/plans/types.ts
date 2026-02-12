import { z } from 'zod'

import { planDetailsSchema } from '@/features/plans/schemas/plan-details'

export interface Plan {
  id: number
  name: string
  price: number
  minDurationMonths: number
  description?: string
  createdAt: Date
  updatedAt: Date
  subscriptionCount?: number
}

export type PlanDisplay = Plan

export interface PlansTableMeta {
  updatePlan: (id: number, data: z.infer<typeof planDetailsSchema>) => void
  openPlanDetails: (plan: PlanDisplay | null) => void
  deletePlan: (id: number) => void
  refreshPlans: () => void
}
