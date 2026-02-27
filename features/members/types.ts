import { PlanDisplayMinimal } from '@/features/plans'
import { SubscriptionDisplay } from '@/features/subscriptions'

export type PaymentType = 'credit_card' | 'iban'

export interface Member {
  id: string
  email: string
  createdAt: Date
  updatedAt: Date
  firstname: string
  lastname: string
  middlename?: string
  address?: string
  birthdate: Date
  phone?: string
  isTrainer?: boolean
  paymentType?: PaymentType
}

export interface MemberDisplay extends Member {
  currentSubscription?: SubscriptionDisplay
  futureSubscription?: SubscriptionDisplay
}

export interface MembersTableMeta {
  plans: PlanDisplayMinimal[]
  onUpdateDetails: (data: MemberDisplay) => void
  onUpdatePayment: (data: MemberDisplay) => void
  onChangePassword: (data: MemberDisplay) => void
  onConvertToMember: (data: MemberDisplay) => void
  onConvertToTrainer: (data: MemberDisplay) => void
  onChooseSubscription: (
    member: MemberDisplay,
    plan: PlanDisplayMinimal
  ) => void
  onChooseFutureSubscription: (
    member: MemberDisplay,
    plan: PlanDisplayMinimal
  ) => void
  onCancelSubscription: (member: MemberDisplay) => void
  onCancelFutureSubscription: (member: MemberDisplay) => void
  onRevertCancelSubscription: (member: MemberDisplay) => void
  onDeleteSubscription: (member: MemberDisplay) => void
  onDelete: (member: MemberDisplay) => void
  onDeleteMany: (members: MemberDisplay[]) => void
}
