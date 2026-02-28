'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

import { getSession } from '@/features/auth'
import { roomDetailsSchema } from '@/features/rooms/schemas/room-details'
import { pool } from '@/features/shared/lib/db'

export async function updateRoom(
  id: string,
  data: z.infer<typeof roomDetailsSchema>,
  lastUpdatedAt: Date
): Promise<{
  success: boolean
  message: string
  errorType?: 'AUTH' | 'NOT_FOUND' | 'VERSION_MISMATCH' | 'VALIDATION' | 'UNKNOWN'
}> {
  try {
    const { member } = await getSession()

    if (!member) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Unauthorized. Please log in to update a room.',
      }
    }

    if (!member.isTrainer) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Only trainers can update rooms.',
      }
    }

    const validated = roomDetailsSchema.parse(data)

    const result = await pool.query(
      `WITH target_room AS (
        SELECT id,
               (date_trunc('milliseconds', updated_at) = $4::timestamptz) AS version_match
        FROM rooms WHERE id = $3
        FOR UPDATE
      ),
      updated_room AS (
        UPDATE rooms
          SET name = $1, capacity = $2, updated_at = NOW()
          WHERE id = $3
            AND (SELECT version_match FROM target_room) = true
          RETURNING id, name
      ),
      log_room AS (
        INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
        SELECT $5, 'Update'::action_type, id, 'room', 'Room ' || name || ' updated'
        FROM updated_room
      )
      SELECT
        (SELECT COUNT(*) FROM target_room) AS found,
        (SELECT version_match FROM target_room) AS version_match,
        (SELECT id FROM updated_room) AS updated_id`,
      [validated.name, validated.capacity, id, lastUpdatedAt, member.id]
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

    return { success: true, message: 'Room updated successfully.' }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errorType: 'VALIDATION',
        message: 'Invalid input data. Please check the form and try again.',
      }
    }
    console.error('[UPDATE_ROOM_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An unexpected error occurred.',
    }
  }
}
