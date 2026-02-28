'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

import { getSession } from '@/features/auth'
import { courseTemplateDetailsSchema } from '@/features/courses/schemas/course-template-details'
import { pool } from '@/features/shared/lib/db'

export async function createCourseTemplate(
  data: z.infer<typeof courseTemplateDetailsSchema>
): Promise<{
  success: boolean
  message: string
  errorType?: 'AUTH' | 'VALIDATION' | 'UNKNOWN'
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

    const validated = courseTemplateDetailsSchema.parse(data)

    await pool.query(
      `WITH inserted AS (
        INSERT INTO course_templates (trainer_id, room_id, name, description, weekdays, start_time, end_time, start_date, end_date)
        VALUES ($1, $2, $3, $4, $5::weekday[], $6, $7, $8, $9)
        RETURNING id, name
      )
      INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
      SELECT $10, 'Create'::action_type, id, 'course_template', 'Course template ' || name || ' created'
      FROM inserted`,
      [
        validated.trainerId,
        validated.roomId,
        validated.name,
        validated.description ?? null,
        validated.weekdays,
        validated.startTime,
        validated.endTime,
        validated.startDate,
        validated.endDate ?? null,
        member.id,
      ]
    )

    updateTag('course-templates')

    return { success: true, message: 'Course template created successfully.' }
  } catch (error: unknown) {
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
