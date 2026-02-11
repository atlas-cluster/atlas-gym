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

export interface GetMembersParams {
  pageIndex: number
  pageSize: number
  sorting?: { id: string; desc: boolean }[]
  columnFilters?: { id: string; value: unknown }[]
  globalFilter?: string
}

export interface GetMembersResponse {
  data: Member[]
  pageCount: number
  rowCount: number
  facets: {
    isTrainer: Record<string, number>
  }
}
