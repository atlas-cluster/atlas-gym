import { z } from 'zod'

import { addressSchema } from '@/features/shared/schemas/address'
import { pastDateSchema } from '@/features/shared/schemas/date'
import { emailSchema } from '@/features/shared/schemas/email'
import {
  optionalNameSchema,
  requiredNameSchema,
} from '@/features/shared/schemas/name'
import { refinePaymentFields } from '@/features/shared/schemas/payment'
import { phoneSchema } from '@/features/shared/schemas/phone'

export const memberBaseSchema = z.object({
  email: emailSchema,
  firstname: requiredNameSchema('First name'),
  lastname: requiredNameSchema('Last name'),
  middlename: optionalNameSchema('Middle name'),
  address: addressSchema,
  birthdate: pastDateSchema('Birthdate'),
  phone: phoneSchema,
  isTrainer: z.boolean(),
  paymentType: z.enum(['credit_card', 'iban']),
  cardHolder: z.string().optional(),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvc: z.string().optional(),
  iban: z.string().optional(),
})

export const memberSchema = memberBaseSchema.superRefine((data, ctx) => {
  refinePaymentFields(data, ctx)
})
