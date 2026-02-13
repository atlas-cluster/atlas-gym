import { memberBaseSchema } from '@/features/members/schemas/member'
import { refinePaymentFields } from '@/features/shared/schemas/payment'

export const memberPaymentSchema = memberBaseSchema
  .pick({
    paymentType: true,
    cardHolder: true,
    cardNumber: true,
    cardExpiry: true,
    cardCvc: true,
    iban: true,
  })
  .superRefine((data, ctx) => {
    refinePaymentFields(data, ctx)
  })
