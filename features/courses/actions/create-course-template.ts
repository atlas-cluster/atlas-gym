'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

import { getSession } from '@/features/auth'
import { courseTemplateSchema } from '@/features/courses/schemas/course-template'
import { pool } from '@/features/shared/lib/db'
import {
  PG_EXCLUSION_VIOLATION,
  PG_UNIQUE_VIOLATION,
} from '@/features/shared/lib/postgres-errors'

export async function createCourseTemplate(
  data: z.infer<typeof courseTemplateSchema>
): Promise<{
  success: boolean
  message: string
  errorType?:
    | 'AUTH'
    | 'NAME_COLLISION'
    | 'SCHEDULE_CONFLICT'
    | 'VALIDATION'
    | 'UNKNOWN'
}> {
  try {
    const { member } = await getSession()

    if (!member) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Unauthorized. Please log in to create a course template.',
      }
    }

    if (!member.isTrainer) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Only trainers can create course templates.',
      }
    }

    const validated = courseTemplateSchema.parse(data)

    const endDate =
      validated.endDate && validated.endDate !== '' ? validated.endDate : null

    await pool.query(
      `WITH inserted_template AS (
          INSERT INTO course_templates (trainer_id, room_id, name, description, banner_image_url, weekdays, start_time, end_time, start_date, end_date)
              VALUES ($1, $2, $3, $4, $5, $6::weekday[], $7::time, $8::time, $9::date, $10::date)
              RETURNING id, name
      )
       INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
       SELECT $11, 'Create'::action_type, id, 'course_template', 'Course template ' || name || ' created'
       FROM inserted_template`,
      [
        validated.trainerId,
        validated.roomId ?? null,
        validated.name,
        validated.description ?? null,
        validated.bannerImageUrl && validated.bannerImageUrl !== ''
          ? validated.bannerImageUrl
          : null,
        `{${validated.weekDays.join(',')}}`,
        validated.startTime,
        validated.endTime,
        validated.startDate,
        endDate,
        member.id,
      ]
    )

    updateTag('courses')

    return {
      success: true,
      message: 'Course template created successfully.',
    }
  } catch (error: unknown) {
    if (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === PG_UNIQUE_VIOLATION
    ) {
      return {
        success: false,
        errorType: 'NAME_COLLISION',
        message: 'A course template with this name already exists.',
      }
    }
    if (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === PG_EXCLUSION_VIOLATION
    ) {
      const constraint =
        'constraint' in error ? (error.constraint as string) : ''
      if (constraint === 'prevent_trainer_time_overlap') {
        return {
          success: false,
          errorType: 'SCHEDULE_CONFLICT',
          message:
            'The trainer already has a course scheduled at this time on one or more of the selected weekdays.',
        }
      }
      if (constraint === 'prevent_room_time_overlap') {
        return {
          success: false,
          errorType: 'SCHEDULE_CONFLICT',
          message:
            'The room already has a course scheduled at this time on one or more of the selected weekdays.',
        }
      }
      return {
        success: false,
        errorType: 'SCHEDULE_CONFLICT',
        message:
          'This course conflicts with an existing schedule. Please choose a different time, day, or room.',
      }
    }
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errorType: 'VALIDATION',
        message: 'Invalid input data. Please check the form and try again.',
      }
    }
    console.error('[CREATE_COURSE_TEMPLATE_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An unexpected error occurred. Please try again later.',
    }
  }
}
