import { z } from 'zod'

import { memberDetailsSchema } from '@/features/members/schemas/member-details'
import { memberPaymentSchema } from '@/features/members/schemas/member-payment'

export type PaymentType = 'credit_card' | 'iban'

export interface Member {
  id: string
  email: string
  created_at: Date
  firstname: string
  lastname: string
  middlename?: string
  address?: string
  birthdate: Date
  phone?: string
  isTrainer?: boolean
  paymentType?: PaymentType
}

export type SessionMember = Omit<
  Member,
  'created_at' | 'address' | 'birthdate' | 'phone' | 'paymentType'
>

export type MemberDisplay = Omit<Member, 'created_at'> & {
  planName?: string
  subscriptionId?: string
  isCancelled?: boolean
  futureSubscriptionName?: string
  futureSubscriptionId?: string
}

export interface MembersTableMeta {
  updateMember: (id: string, data: z.infer<typeof memberDetailsSchema>) => void
  updateMemberPayment: (
    id: string,
    data: z.infer<typeof memberPaymentSchema>
  ) => void
  openMemberDetails: (member: MemberDisplay) => void
  openMemberPayment: (member: MemberDisplay) => void
  openChangePassword: (member: MemberDisplay) => void
  deleteMember: (id: string) => void
  deleteMembers: (ids: string[]) => void
  convertToMember: (id: string) => void
  convertToTrainer: (id: string) => void
  refreshMembers: () => void
  cancelSubscription?: (member: MemberDisplay) => void
  revertCancellation?: (member: MemberDisplay) => void
  changeSubscription?: (member: MemberDisplay, planId: number) => void
  cancelFutureSubscription?: (member: MemberDisplay) => void
  choosePlan?: (member: MemberDisplay, planId: number) => void
  availablePlans?: {
    id: number
    name: string
    price: number
    minDurationMonths: number
  }[]
}
