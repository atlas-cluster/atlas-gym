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
  paymentType: PaymentType
  isTrainer?: boolean
}

export interface MembersTableMeta {
  updateMember: (id: string, data: z.infer<typeof memberDetailsSchema>) => void
  updateMemberPayment: (
    id: string,
    data: z.infer<typeof memberPaymentSchema>
  ) => void
  openMemberDetails: (member: Member) => void
  openMemberPayment: (member: Member) => void
  deleteMember: (id: string) => void
  deleteMembers: (ids: string[]) => void
  convertToMember: (id: string) => void
  convertToTrainer: (id: string) => void
  refreshMembers: () => void
}
