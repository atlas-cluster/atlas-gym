import { paymentMethodSchema } from './payment'
import { z } from 'zod'

import { addressSchema } from '@/features/shared/schemas/address'
import { pastDateSchema } from '@/features/shared/schemas/date'
import { emailSchema } from '@/features/shared/schemas/email'
import {
  optionalNameSchema,
  requiredNameSchema,
} from '@/features/shared/schemas/name'
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
    paymentMethod: paymentMethodSchema,
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords don't match",
    path: ['repeatPassword'],
  })
