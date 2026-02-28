import { z } from 'zod'

export const roomDetailsSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be at most 50 characters'),
  capacity: z
    .number()
    .int()
    .min(1, 'Capacity must be at least 1')
    .max(1000, 'Capacity must be at most 1000'),
})
