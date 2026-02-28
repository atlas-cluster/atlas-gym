'use server'

import { updateTag } from 'next/cache'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function deleteCourseTemplate(
  id: string,
  lastUpdatedAt: Date
): Promise<{
  success: boolean
  message: string
  errorType?: 'AUTH' | 'NOT_FOUND' | 'VERSION_MISMATCH' | 'UNKNOWN'
}> {
  try {
    const { member } = await getSession()

    if (!member) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Unauthorized. Please log in to delete a course template.',
      }
    }

    if (!member.isTrainer) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Only trainers can delete course templates.',
      }
    }

    const result = await pool.query(
      `WITH target AS (
        SELECT id, name,
               (date_trunc('milliseconds', updated_at) = $2::timestamptz) AS version_match
        FROM course_templates WHERE id = $1
        FOR UPDATE
      ),
      deleted AS (
        DELETE FROM course_templates
        WHERE id = $1
          AND (SELECT version_match FROM target) = true
        RETURNING id, name
      ),
      log AS (
        INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
        SELECT $3, 'Delete'::action_type, id, 'course_template', 'Course template ' || name || ' deleted'
        FROM deleted
      )
      SELECT
        (SELECT COUNT(*) FROM target) AS found,
        (SELECT version_match FROM target) AS version_match,
        (SELECT id FROM deleted) AS deleted_id`,
      [id, lastUpdatedAt, member.id]
    )

    const row = result.rows[0]

    if (parseInt(row.found) === 0) {
      return { success: false, errorType: 'NOT_FOUND', message: 'Course template not found.' }
    }

    if (!row.version_match) {
      return {
        success: false,
        errorType: 'VERSION_MISMATCH',
        message: 'Course template was modified by another user. Please refresh and try again.',
      }
    }

    updateTag('course-templates')

    return { success: true, message: 'Course template deleted successfully.' }
  } catch (error: unknown) {
    console.error('[DELETE_COURSE_TEMPLATE_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An error occurred while deleting the course template.',
    }
  }
}
