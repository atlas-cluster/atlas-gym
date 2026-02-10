import { z } from 'zod'

import { addressSchema } from '@/features/shared/schemas/address'
import { pastDateSchema } from '@/features/shared/schemas/date'
import { emailSchema } from '@/features/shared/schemas/email'
import {
  optionalNameSchema,
  requiredNameSchema,
} from '@/features/shared/schemas/name'
import { creditCardSchema, ibanSchema } from '@/features/shared/schemas/payment'
import { phoneSchema } from '@/features/shared/schemas/phone'

export const registerSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(4, 'Password must be at least 4 characters'),
    repeatPassword: z.string(),
    firstname: requiredNameSchema('First name'),
    lastname: requiredNameSchema('Last name'),
    middlename: optionalNameSchema('Middle name'),
    address: addressSchema,
    birthdate: pastDateSchema('Birthdate'),
    phone: phoneSchema,
    paymentType: z.enum(['credit_card', 'iban']),
    cardHolder: z.string().optional(),
    cardNumber: z.string().optional(),
    cardExpiry: z.string().optional(),
    cardCvc: z.string().optional(),
    iban: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.repeatPassword) {
      ctx.addIssue({
        code: 'custom',
        message: "Passwords don't match",
        path: ['repeatPassword'],
      })
    }

    if (data.paymentType === 'credit_card') {
      const result = creditCardSchema.safeParse({
        type: 'credit_card',
        cardNumber: data.cardNumber,
        cardHolder: data.cardHolder,
        cardExpiry: data.cardExpiry,
        cardCvc: data.cardCvc,
      })

      if (!result.success) {
        result.error.issues.forEach((issue) => {
          if (issue.path[0] !== 'type') {
            const issueData = {
              ...issue,
              path: [issue.path[0]],
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ctx.addIssue(issueData as any)
          }
        })
      }
    } else if (data.paymentType === 'iban') {
      const result = ibanSchema.safeParse({
        type: 'iban',
        iban: data.iban,
      })

      if (!result.success) {
        result.error.issues.forEach((issue) => {
          if (issue.path[0] !== 'type') {
            const issueData = {
              ...issue,
              path: [issue.path[0]],
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ctx.addIssue(issueData as any)
          }
        })
      }
    }
  })
