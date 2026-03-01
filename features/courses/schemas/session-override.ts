import { z } from 'zod'

const timeRegex = /^\d{2}:\d{2}$/

export const sessionOverrideSchema = z
  .object({
    nameOverride: z
      .string()
      .max(100, 'Name must be at most 100 characters')
      .optional()
      .or(z.literal('')),
    descriptionOverride: z
      .string()
      .max(500, 'Description must be at most 500 characters')
      .optional()
      .or(z.literal('')),
    trainerIdOverride: z
      .uuid('Invalid trainer selected')
      .optional()
      .or(z.literal('')),
    roomIdOverride: z
      .uuid('Invalid room selected')
      .optional()
      .or(z.literal('')),
    startTimeOverride: z
      .string()
      .regex(timeRegex, 'Start time must be in HH:MM format')
      .optional()
      .or(z.literal('')),
    endTimeOverride: z
      .string()
      .regex(timeRegex, 'End time must be in HH:MM format')
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.startTimeOverride && data.endTimeOverride) {
        return data.endTimeOverride > data.startTimeOverride
      }
      return true
    },
    {
      message: 'End time must be after start time',
      path: ['endTimeOverride'],
    }
  )
