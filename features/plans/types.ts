import { z } from 'zod'

import { planDetailsSchema } from '@/features/plans/schemas/plan-details'

export interface Plan {
  id: string
  name: string
  price: number
  minDurationMonths: number
  description?: string
  createdAt: Date
  updatedAt: Date
}

export type PlanDisplay = Plan & {
  subscriptionCount?: number
}

export interface PlansTableMeta {
  createPlan: (data: z.infer<typeof planDetailsSchema>) => Promise<void>
  updatePlan: (
    id: string,
    data: z.infer<typeof planDetailsSchema>,
    lastUpdatedAt: Date
  ) => Promise<void>
  deletePlan: (id: string) => Promise<void>
  refreshPlans: () => void
}
