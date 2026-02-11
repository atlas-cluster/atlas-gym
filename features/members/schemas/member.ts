import { z } from 'zod'

import { addressSchema } from '@/features/shared/schemas/address'
import { pastDateSchema } from '@/features/shared/schemas/date'
import { emailSchema } from '@/features/shared/schemas/email'
import {
  optionalNameSchema,
  requiredNameSchema,
} from '@/features/shared/schemas/name'
import { phoneSchema } from '@/features/shared/schemas/phone'

export const memberSchema = z.object({
  email: emailSchema,
  firstname: requiredNameSchema('First name'),
  lastname: requiredNameSchema('Last name'),
  middlename: optionalNameSchema('Middle name'),
  address: addressSchema,
  birthdate: pastDateSchema('Birthdate'),
  phone: phoneSchema,
  isTrainer: z.boolean(),
})
