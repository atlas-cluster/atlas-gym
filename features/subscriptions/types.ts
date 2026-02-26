import { Plan } from '@/features/plans'

export interface SubscriptionDisplay extends Plan {
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
