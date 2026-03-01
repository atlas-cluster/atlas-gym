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
      `WITH target_template AS (
         SELECT id, name,
                (date_trunc('milliseconds', updated_at) = $3::timestamptz) AS version_match
         FROM course_templates WHERE id = $1
         FOR UPDATE
      ),
      affected_sessions AS (
        SELECT cs.id, cs.session_date
        FROM course_sessions cs
        WHERE cs.template_id = $1
          AND (SELECT version_match FROM target_template) = true
      ),
      log_sessions AS (
        INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
        SELECT $2, 'Delete'::action_type, s.id, 'course_session',
          'Session on ' || s.session_date || ' deleted (cascade) due to deletion of course template ' || (SELECT name FROM target_template)
        FROM affected_sessions s
      ),
      deleted_template AS (
         DELETE FROM course_templates
         WHERE id = $1
           AND (SELECT version_match FROM target_template) = true
         RETURNING id, name
      ),
      log_template AS (
         INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
         SELECT $2, 'Delete'::action_type, id, 'course_template', 'Course template ' || name || ' deleted'
         FROM deleted_template
      )
      SELECT
        (SELECT COUNT(*) FROM target_template) AS found,
        (SELECT version_match FROM target_template) AS version_match,
        (SELECT id FROM deleted_template) AS deleted_id`,
      [id, member.id, lastUpdatedAt]
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

    return {
      success: true,
      message: 'Course template and associated sessions deleted successfully.',
    }
  } catch (error: unknown) {
    console.error('[DELETE_COURSE_TEMPLATE_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An error occurred while deleting the course template.',
    }
  }
}
