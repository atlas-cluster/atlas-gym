import { z } from 'zod'

export const creditCardSchema = z.object({
  type: z.literal('credit_card'),
  cardNumber: z
    .string()
    .min(12, 'Card number is too short')
    .max(19, 'Card number is too long'),
  cardHolder: z.string().min(1, 'Card holder name is required'),
  cardExpMonth: z.coerce.number().min(1).max(12),
  cardExpYear: z.coerce.number().min(new Date().getFullYear()),
  cardCvc: z.string().min(3).max(4),
})

export const ibanSchema = z.object({
  type: z.literal('iban'),
  iban: z.string().min(15, 'IBAN is too short').max(34, 'IBAN is too long'),
})

export const paymentMethodSchema = z.discriminatedUnion('type', [
  creditCardSchema,
  ibanSchema,
])
