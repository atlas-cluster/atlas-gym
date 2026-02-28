'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

import { getSession } from '@/features/auth'
import { roomDetailsSchema } from '@/features/rooms/schemas/room-details'
import { pool } from '@/features/shared/lib/db'

export async function createRoom(
  data: z.infer<typeof roomDetailsSchema>
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
        message: 'Unauthorized. Please log in to create a room.',
      }
    }

    if (!member.isTrainer) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Only trainers can create rooms.',
      }
    }

    const validated = roomDetailsSchema.parse(data)

    await pool.query(
      `WITH inserted_room AS (
          INSERT INTO rooms (name, capacity)
              VALUES ($1, $2)
              RETURNING id, name
      )
       INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
       SELECT $3, 'Create'::action_type, id, 'room', 'Room ' || name || ' created'
       FROM inserted_room`,
      [validated.name, validated.capacity, member.id]
    )

    updateTag('rooms')

    return {
      success: true,
      message: 'Room created successfully.',
    }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errorType: 'VALIDATION',
        message: 'Invalid input data. Please check the form and try again.',
      }
    }
    console.error('[CREATE_ROOM_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An unexpected error occurred. Please try again later.',
    }
  }
}
