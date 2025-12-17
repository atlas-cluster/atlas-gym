import { z } from 'zod'

/**
 * Validation schemas for user input sanitization and validation
 */

// Email validation
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required')
  .max(255, 'Email is too long')
  .toLowerCase()
  .trim()

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  )

// Name validation (for first, middle, last names)
export const nameSchema = z
  .string()
  .min(1, 'This field is required')
  .max(50, 'Name is too long')
  .regex(
    /^[a-zA-Z\s'-]+$/,
    'Only letters, spaces, hyphens, and apostrophes are allowed'
  )
  .trim()

// Optional name validation
export const optionalNameSchema = z
  .string()
  .max(50, 'Name is too long')
  .regex(
    /^[a-zA-Z\s'-]*$/,
    'Only letters, spaces, hyphens, and apostrophes are allowed'
  )
  .trim()
  .optional()
  .or(z.literal(''))

// Phone validation
export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .max(20, 'Phone number is too long')
  .regex(/^[+\d\s()-]+$/, 'Invalid phone number format')
  .trim()

// Address validation
export const addressSchema = z
  .string()
  .min(1, 'Address is required')
  .max(200, 'Address is too long')
  .trim()

// Date validation
export const dateSchema = z
  .string()
  .min(1, 'Please select a date')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
  .refine((date) => {
    const d = new Date(date)
    return d instanceof Date && !isNaN(d.getTime())
  }, 'Invalid date')

export const pastDateSchema = dateSchema.refine((date) => {
  const d = new Date(date)
  const today = new Date()
  return d < today
}, 'Date must be in the past')

// Payment type validation
export const paymentTypeSchema = z.enum(['credit_card', 'iban'])

// Credit card number validation (basic Luhn algorithm check)
export const creditCardNumberSchema = z
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
  }, 'Invalid card number')

// Credit card expiry validation (MM/YY or MM/YYYY format)
export const creditCardExpirySchema = z
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
  }, 'Card has expired')

// Credit card CVC validation
export const creditCardCVCSchema = z
  .string()
  .min(1, 'CVC is required')
  .regex(/^\d{3,4}$/, 'CVC must be 3 or 4 digits')

// IBAN validation
export const ibanSchema = z
  .string()
  .min(1, 'IBAN is required')
  .regex(/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/i, 'Invalid IBAN format')
  .transform((iban) => iban.replace(/\s/g, '').toUpperCase())

// Credit card data object
export const creditCardDataSchema = z.object({
  cardNumber: creditCardNumberSchema,
  cardExpiry: creditCardExpirySchema,
  cardCVC: creditCardCVCSchema,
})

// Payment info validation - can be credit card data object or IBAN string
export const paymentInfoSchema = z
  .union([creditCardDataSchema, z.object({ iban: ibanSchema })])
  .superRefine((data, ctx) => {
    // Provide more specific error messages without nested paths
    // This ensures errors appear in fieldState.error for the paymentInfo field
    if ('cardNumber' in data) {
      // Validate each credit card field individually for better error messages
      const cardNumberResult = creditCardNumberSchema.safeParse(data.cardNumber)
      if (!cardNumberResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            cardNumberResult.error.issues[0]?.message || 'Invalid card number',
        })
      }

      const cardExpiryResult = creditCardExpirySchema.safeParse(data.cardExpiry)
      if (!cardExpiryResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            cardExpiryResult.error.issues[0]?.message || 'Invalid expiry date',
        })
      }

      const cardCVCResult = creditCardCVCSchema.safeParse(data.cardCVC)
      if (!cardCVCResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: cardCVCResult.error.issues[0]?.message || 'Invalid CVC',
        })
      }
    } else if ('iban' in data) {
      const ibanResult = ibanSchema.safeParse(data.iban)
      if (!ibanResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: ibanResult.error.issues[0]?.message || 'Invalid IBAN',
        })
      }
    }
  })

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

// Full registration schema (for final submission)
export const registrationSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    passwordrepeat: z.string().min(1, 'Please confirm your password'),
    firstname: nameSchema,
    middlename: optionalNameSchema,
    lastname: nameSchema,
    birthdate: pastDateSchema,
    phone: phoneSchema,
    address: addressSchema,
    paymentType: paymentTypeSchema,
    paymentInfo: paymentInfoSchema,
  })
  .refine((data) => data.password === data.passwordrepeat, {
    message: "Passwords don't match",
    path: ['passwordrepeat'],
  })

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type RegistrationInput = z.infer<typeof registrationSchema>
