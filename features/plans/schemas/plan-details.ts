import { z } from 'zod'

export const planDetailsSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be at most 50 characters'),
  price: z
    .number()
    .min(0, 'Price must be non-negative')
    .max(1000, 'Price must be at most 1000.00€'),
  minDurationMonths: z
    .number()
    .int()
    .min(1, 'Minimum duration must be at least 1 month')
    .max(24, 'Minimum duration must be at most 24 months'),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional(),
})
