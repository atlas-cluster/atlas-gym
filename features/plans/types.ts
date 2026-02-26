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
