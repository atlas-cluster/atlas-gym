export interface Plan {
  id: string
  name: string
  price: number
  minDurationMonths: number
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface PlanDisplay extends Plan {
  subscriptionCount?: number
}

export type PlanDisplayMinimal = Omit<
  PlanDisplay,
  'description' | 'subscriptionCount'
>
