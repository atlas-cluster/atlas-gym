export type User = {
  id: string
  createdAt: Date
  firstname: string
  lastname: string
  middlename?: string
  email: string
  address: string
  birthdate: Date
  phone: string
  isTrainer: boolean
}

export type Session = {
  id: string
  user_id: string
  expires_at: Date
  created_at: Date
}
