/**
 * Centralized type definitions for the application
 */

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

/**
 * Database User type - matches the database schema
 */
export interface User {
  id: string
  created_at: Date
  user_firstname: string
  user_lastname: string
  user_middlename?: string
  user_email: string
  user_address?: string
  user_birthdate: Date
  user_phone?: string
  isTrainer?: boolean
}

/**
 * Database Session type
 */
export interface Session {
  id: string
  user_id: string
  expires_at: Date
  created_at: Date
}

/**
 * API User type - formatted for frontend consumption
 * This matches the data returned by the session API endpoint
 */
export interface UserData {
  id: string
  email: string
  firstname: string
  lastname: string
  middlename?: string
  birthdate: string
  address?: string
  phone?: string
  isTrainer: boolean
}
