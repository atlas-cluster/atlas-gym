import { z } from 'zod'

import { memberSchema } from '@/features/members'

export const registerSchema = memberSchema.extend({
  password: z.string().min(4, 'Password must be at least 4 characters'),
  repeatPassword: z.string(),
})
