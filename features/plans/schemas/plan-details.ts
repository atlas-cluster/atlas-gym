import { z } from 'zod'

export const planDetailsSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be at most 50 characters'),
  price: z.number().min(0, 'Price must be non-negative'),
  minDurationMonths: z
    .number()
    .int()
    .min(1, 'Minimum duration must be at least 1 month'),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
})
