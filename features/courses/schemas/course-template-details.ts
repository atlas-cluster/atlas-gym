import { z } from 'zod'

export const courseTemplateDetailsSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100),
    description: z.string().max(500).optional(),
    trainerId: z.string().uuid('Please select a trainer'),
    roomId: z.string().uuid('Please select a room'),
    weekdays: z
      .array(
        z.enum([
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday',
        ])
      )
      .min(1, 'Select at least one day'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  })
