export interface Session {
  id: string
  member_id: string
  expires_at: Date
  created_at: Date
}

export type LoginError =
  | 'INVALID_CREDENTIALS'
  | 'MEMBER_NOT_FOUND'
  | 'INVALID_INPUT'
  | 'UNKNOWN_ERROR'
export type CheckEmailError =
  | 'EMAIL_ALREADY_EXISTS'
  | 'INVALID_EMAIL'
  | 'UNKNOWN_ERROR'
