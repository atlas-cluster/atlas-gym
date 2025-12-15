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
  .regex(/^[a-zA-Z\s'-]+$/, 'Only letters, spaces, hyphens, and apostrophes are allowed')
  .trim()

// Optional name validation
export const optionalNameSchema = z
  .string()
  .max(50, 'Name is too long')
  .regex(/^[a-zA-Z\s'-]*$/, 'Only letters, spaces, hyphens, and apostrophes are allowed')
  .trim()
  .optional()
  .or(z.literal(''))

// Phone validation
export const phoneSchema = z
  .string()
  .max(20, 'Phone number is too long')
  .regex(/^[+\d\s()-]*$/, 'Invalid phone number format')
  .trim()
  .optional()
  .or(z.literal(''))

// Address validation
export const addressSchema = z
  .string()
  .max(200, 'Address is too long')
  .trim()
  .optional()
  .or(z.literal(''))

// Date validation
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
  .refine((date) => {
    const d = new Date(date)
    return d instanceof Date && !isNaN(d.getTime())
  }, 'Invalid date')

// Payment type validation
export const paymentTypeSchema = z.enum(['credit_card', 'iban'], {
  errorMap: () => ({ message: 'Invalid payment type' }),
})

// Payment info validation
export const paymentInfoSchema = z
  .string()
  .max(100, 'Payment info is too long')
  .trim()
  .optional()
  .or(z.literal(''))

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

// Registration schema
export const registrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  passwordrepeat: z.string().min(1, 'Please confirm your password'),
  firstname: nameSchema,
  middlename: optionalNameSchema,
  lastname: nameSchema,
  birthdate: dateSchema,
  phone: phoneSchema,
  address: addressSchema,
  paymentType: paymentTypeSchema.optional(),
  paymentInfo: paymentInfoSchema,
}).refine((data) => data.password === data.passwordrepeat, {
  message: "Passwords don't match",
  path: ['passwordrepeat'],
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type RegistrationInput = z.infer<typeof registrationSchema>
