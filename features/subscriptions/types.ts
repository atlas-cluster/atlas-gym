export interface Subscription {
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
  cancelledAt?: Date
}

export interface MemberSubscriptionDisplay extends Subscription {
  canCancel: boolean
  canChooseNew: boolean
}
