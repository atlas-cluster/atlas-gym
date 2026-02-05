import { z } from 'zod'

export const loginSchema = z.object({
  // Not using shared email schema, so you can login with non-email usernames like 'admin'
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
})
