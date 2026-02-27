import { z } from 'zod'

import { requiredNameSchema } from '@/features/shared/schemas/name'

export const creditCardSchema = z.object({
  type: z.literal('credit_card'),
  cardNumber: z
    .string()
    .min(1, 'Card number is required')
    .regex(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{3,4}$/, 'Invalid card number format')
    .refine((cardNumber) => {
      // Remove spaces and validate using Luhn algorithm
      const digits = cardNumber.replace(/\s/g, '')
      let sum = 0
      let isEven = false

      for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i], 10)

        if (isEven) {
          digit *= 2
          if (digit > 9) {
            digit -= 9
          }
        }

        sum += digit
        isEven = !isEven
      }

      return sum % 10 === 0
    }, 'Invalid card number'),
  cardHolder: requiredNameSchema('Card holder name'),
  cardExpiry: z
    .string()
    .min(1, 'Expiry date is required')
    .regex(
      /^(0[1-9]|1[0-2])\s?\/\s?(\d{2}|\d{4})$/,
      'Invalid expiry format (MM/YY)'
    )
    .refine((expiry) => {
      // Check if card is not expired
      const parts = expiry.split('/').map((p) => p.trim())
      const month = parseInt(parts[0], 10)
      const year = parseInt(parts[1], 10)

      // Convert 2-digit year to 4-digit
      const fullYear = year < 100 ? 2000 + year : year

      // Get the last day of the expiry month (month - 1 because Date months are 0-indexed)
      const expiryDate = new Date(fullYear, month, 0)
      const today = new Date()

      return expiryDate >= today
    }, 'Card has expired'),
  cardCvc: z
    .string()
    .min(1, 'CVC is required')
    .regex(/^\d{3,4}$/, 'CVC must be 3 or 4 digits'),
})

export const ibanSchema = z.object({
  type: z.literal('iban'),
  iban: z
    .string()
    .transform((val) => val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())
    .pipe(z.string().min(15, 'IBAN is too short').max(34, 'IBAN is too long')),
})

export const paymentMethodSchema = z.discriminatedUnion('type', [
  creditCardSchema,
  ibanSchema,
])

type PaymentRefinementInput = {
  paymentType: 'credit_card' | 'iban'
  cardNumber?: string
  cardHolder?: string
  cardExpiry?: string
  cardCvc?: string
  iban?: string
}

export function refinePaymentFields(
  data: PaymentRefinementInput,
  ctx: z.RefinementCtx
) {
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
          ctx.addIssue({
            ...issue,
            path: [issue.path[0]],
          })
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
          ctx.addIssue({
            ...issue,
            path: [issue.path[0]],
          })
        }
      })
    }
  }
}
