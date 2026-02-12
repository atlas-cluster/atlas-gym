import { z } from 'zod'

import { memberBaseSchema } from '@/features/members'
import { refinePaymentFields } from '@/features/shared/schemas/payment'

export const registerSchema = memberBaseSchema
  .extend({
    password: z.string().min(4, 'Password must be at least 4 characters'),
    repeatPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    refinePaymentFields(data, ctx)

    if (data.password !== data.repeatPassword) {
      ctx.addIssue({
        code: 'custom',
        message: "Passwords don't match",
        path: ['repeatPassword'],
      })
    }
  })
