/**
 * Payment method data structure
 */
export interface PaymentMethod {
  id: string
  user_id: string
  payment_type: 'credit_card' | 'iban'
  // Credit card fields
  card_number?: string
  card_expiry?: string
  // IBAN field
  iban?: string
  created_at: Date
  updated_at: Date
}
