import { z } from 'zod'

import { memberSchema } from '@/features/members/schemas/member'

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

export type PaymentMethod = CreditCardDetails | BankAccountDetails

export interface CreditCardDetails {
  card_number: string
  cardholder_name: string
  card_expiry: string
  card_cvc: string
}

export interface BankAccountDetails {
  iban: string
}

export interface MembersTableMeta {
  updateMember: (id: string, data: z.infer<typeof memberSchema>) => void
  deleteMember: (id: string) => void
  deleteMembers: (ids: string[]) => void
  convertToMember: (id: string) => void
  convertToTrainer: (id: string) => void
  refreshMembers: () => void
}
