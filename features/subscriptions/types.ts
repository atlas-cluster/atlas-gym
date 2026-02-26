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

export interface SubscriptionResponse {
  subscriptions: SubscriptionDisplay[]
  canCreate: boolean
}

export interface MemberSubscriptionDisplay {
  id: string
  memberId: string
  planId: string
  planName: string
  planPrice: number
  planMinDurationMonths: number
  planDescription?: string
  startDate: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
  status: 'active' | 'cancelled' | 'ended' | 'future'
  canCancel: boolean
  canChooseNew: boolean
}
