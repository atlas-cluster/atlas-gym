import { z } from 'zod'

export const phoneSchema = z
  .string()
  .min(1, 'Please enter a phone number.')
  .max(20, 'Phone number is too long.')
  .regex(/^[+\d]+$/, 'Invalid phone number format.')
  .trim()
