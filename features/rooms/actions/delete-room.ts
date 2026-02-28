'use server'

import { updateTag } from 'next/cache'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function deleteRoom(
  id: string,
  lastUpdatedAt: Date
): Promise<{
  success: boolean
  message: string
  errorType?: 'AUTH' | 'NOT_FOUND' | 'VERSION_MISMATCH' | 'HAS_TEMPLATES' | 'UNKNOWN'
}> {
  try {
    const { member } = await getSession()

    if (!member) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Unauthorized. Please log in to delete a room.',
      }
    }

    if (!member.isTrainer) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Only trainers can delete rooms.',
      }
    }

    const templateCheck = await pool.query(
      `SELECT COUNT(*) FROM course_templates WHERE room_id = $1 AND (end_date IS NULL OR end_date >= CURRENT_DATE)`,
      [id]
    )

    if (parseInt(templateCheck.rows[0].count, 10) > 0) {
      return {
        success: false,
        errorType: 'HAS_TEMPLATES',
        message: 'This room has active course templates and cannot be deleted.',
      }
    }

    const result = await pool.query(
      `WITH target_room AS (
         SELECT id, name,
                (date_trunc('milliseconds', updated_at) = $3::timestamptz) AS version_match
         FROM rooms WHERE id = $1
         FOR UPDATE
      ),
      deleted_room AS (
         DELETE FROM rooms
         WHERE id = $1
           AND (SELECT version_match FROM target_room) = true
         RETURNING id, name
      ),
      log_room AS (
         INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
         SELECT $2, 'Delete'::action_type, id, 'room', 'Room ' || name || ' deleted'
         FROM deleted_room
      )
      SELECT
        (SELECT COUNT(*) FROM target_room) AS found,
        (SELECT version_match FROM target_room) AS version_match,
        (SELECT id FROM deleted_room) AS deleted_id`,
      [id, member.id, lastUpdatedAt]
    )

    const row = result.rows[0]

    if (parseInt(row.found) === 0) {
      return {
        success: false,
        errorType: 'NOT_FOUND',
        message: 'Room not found.',
      }
    }

    if (!row.version_match) {
      return {
        success: false,
        errorType: 'VERSION_MISMATCH',
        message: 'Room was modified by another user. Please refresh and try again.',
      }
    }

    updateTag('rooms')

    return {
      success: true,
      message: 'Room deleted successfully.',
    }
  } catch (error: unknown) {
    console.error('[DELETE_ROOM_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An error occurred while deleting the room.',
    }
  }
}
