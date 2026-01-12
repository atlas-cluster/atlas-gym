export type User = {
  id: string
  created_at: Date
  user_firstname: string
  user_lastname: string
  user_middlename?: string
  user_email: string
  user_address?: string
  user_birthdate: Date
  user_phone?: string
  isTrainer: boolean
}

export type Session = {
  id: string
  user_id: string
  expires_at: Date
  created_at: Date
}
