import { z } from 'zod'

export const planDetailsSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be at most 50 characters'),
  price: z
    .number()
    .min(0, 'Price must be non-negative')
    .or(z.string().transform((val) => parseFloat(val)))
    .refine((val) => !isNaN(val as number) && val >= 0, {
      message: 'Price must be a valid non-negative number',
    }),
  minDurationMonths: z
    .number()
    .int()
    .min(0, 'Minimum duration must be non-negative')
    .or(z.string().transform((val) => parseInt(val)))
    .refine((val) => !isNaN(val as number) && val >= 0, {
      message: 'Minimum duration must be a valid non-negative integer',
    }),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
})
