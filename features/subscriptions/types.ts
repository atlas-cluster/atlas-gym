import { Plan } from '@/features/plans'

export interface SubscriptionDisplay extends Omit<
  Plan,
  'id' | 'updatedAt' | 'createdAt'
> {
  id?: string
  planId: string
  planCreatedAt: Date
  planUpdatedAt: Date
  updatedAt?: Date
  startDate?: Date
  endDate?: Date
  isActive?: boolean
  isCancelled?: boolean
  isFuture?: boolean
}
