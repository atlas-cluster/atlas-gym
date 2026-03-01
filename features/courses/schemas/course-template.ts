import { z } from 'zod'

const weekdays = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

const timeRegex = /^\d{2}:\d{2}(:\d{2})?$/
const dateRegex = /^\d{4}-\d{2}-\d{2}$/

export const courseTemplateSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(50, 'Name must be at most 50 characters'),
    description: z
      .string()
      .max(500, 'Description must be at most 500 characters')
      .optional(),
    trainerId: z.uuid('Invalid Trainer selected'),
    roomId: z.uuid('Invalid Room selected').optional(),
    weekDays: z
      .array(z.enum(weekdays))
      .min(1, 'At least one weekday is required'),
    startTime: z
      .string()
      .regex(timeRegex, 'Start time must be in HH:MM format'),
    endTime: z.string().regex(timeRegex, 'End time must be in HH:MM format'),
    startDate: z
      .string()
      .min(1, 'Start date is required')
      .regex(dateRegex, 'Invalid date format'),
    endDate: z
      .string()
      .regex(dateRegex, 'Invalid date format')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  })
  .refine(
    (data) => {
      const end = data.endDate && data.endDate !== '' ? data.endDate : null
      return !end || end >= data.startDate
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }
  )
