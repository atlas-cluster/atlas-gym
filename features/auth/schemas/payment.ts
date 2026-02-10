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
    .refine(
      (val) => val.replace(/[^a-zA-Z0-9]/g, '').length >= 15,
      'IBAN is too short'
    )
    .refine(
      (val) => val.replace(/[^a-zA-Z0-9]/g, '').length <= 34,
      'IBAN is too long'
    ),
})

export const paymentMethodSchema = z.discriminatedUnion('type', [
  creditCardSchema,
  ibanSchema,
])
