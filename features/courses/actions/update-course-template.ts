'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

import { getSession } from '@/features/auth'
import { courseTemplateSchema } from '@/features/courses/schemas/course-template'
import { pool } from '@/features/shared/lib/db'

export async function updateCourseTemplate(
  id: string,
  data: z.infer<typeof courseTemplateSchema>,
  lastUpdatedAt: Date
): Promise<{
  success: boolean
  message: string
  errorType?:
    | 'AUTH'
    | 'NOT_FOUND'
    | 'VERSION_MISMATCH'
    | 'VALIDATION'
    | 'UNKNOWN'
}> {
  try {
    const { member } = await getSession()

    if (!member) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Unauthorized. Please log in to update a course template.',
      }
    }

    if (!member.isTrainer) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Only trainers can update course templates.',
      }
    }

    const validated = courseTemplateSchema.parse(data)

    const endDate =
      validated.endDate && validated.endDate !== '' ? validated.endDate : null

    const result = await pool.query(
      `WITH target_template AS (
        SELECT id,
               (date_trunc('milliseconds', updated_at) = $10::timestamptz) AS version_match
        FROM course_templates WHERE id = $9
        FOR UPDATE
      ),
      updated_template AS (
        UPDATE course_templates
          SET trainer_id = $1,
              room_id = $2,
              name = $3,
              description = $4,
              weekdays = $5::weekday[],
              start_time = $6::time,
              end_time = $7::time,
              start_date = $8::date,
              end_date = $11::date,
              updated_at = NOW()
          WHERE id = $9
            AND (SELECT version_match FROM target_template) = true
          RETURNING id, name
      ),
      log_template AS (
        INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
        SELECT $12, 'Update'::action_type, id, 'course_template', 'Course template ' || name || ' updated'
        FROM updated_template
      )
      SELECT
        (SELECT COUNT(*) FROM target_template) AS found,
        (SELECT version_match FROM target_template) AS version_match,
        (SELECT id FROM updated_template) AS updated_id`,
      [
        validated.trainerId,
        validated.roomId ?? null,
        validated.name,
        validated.description ?? null,
        `{${validated.weekDays.join(',')}}`,
        validated.startTime,
        validated.endTime,
        validated.startDate,
        id,
        lastUpdatedAt,
        endDate,
        member.id,
      ]
    )

    const row = result.rows[0]

    if (parseInt(row.found) === 0) {
      return {
        success: false,
        errorType: 'NOT_FOUND',
        message: 'Course template not found.',
      }
    }

    if (!row.version_match) {
      return {
        success: false,
        errorType: 'VERSION_MISMATCH',
        message:
          'Course template was modified by another user. Please refresh and try again.',
      }
    }

    updateTag('courses')

    return { success: true, message: 'Course template updated successfully.' }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errorType: 'VALIDATION',
        message: 'Invalid input data. Please check the form and try again.',
      }
    }
    console.error('[UPDATE_COURSE_TEMPLATE_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An unexpected error occurred.',
    }
  }
}
