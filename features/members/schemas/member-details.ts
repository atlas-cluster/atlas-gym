import { memberBaseSchema } from '@/features/members/schemas/member'

export const memberDetailsSchema = memberBaseSchema.pick({
  email: true,
  firstname: true,
  lastname: true,
  middlename: true,
  address: true,
  birthdate: true,
  phone: true,
})
