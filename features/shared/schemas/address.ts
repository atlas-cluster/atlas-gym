import { z } from 'zod'

export const addressSchema = z
  .string()
  .min(1, 'Address is required')
  .max(200, 'Address is too long')
  .trim()
