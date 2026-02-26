import { Plan } from '@/features/plans'

export interface SubscriptionDisplay extends Plan {
  subscriptionId?: string
  startDate?: Date
  endDate?: Date
  isActive?: boolean
  isCancelled?: boolean
  isFuture?: boolean
}

export interface SubscriptionResponse {
  subscriptions: SubscriptionDisplay[]
  canCreate: boolean
}
