export interface User {
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

export interface Session {
  id: string
  user_id: string
  expires_at: Date
  created_at: Date
}

export type PaymentMethod = CreditCardDetails | BankAccountDetails

export interface CreditCardDetails {
  card_number: string
  cardholder_name: string
  expiration_month: number
  expiration_year: number
  card_cvc: string
}

export interface BankAccountDetails {
  iban: string
}
