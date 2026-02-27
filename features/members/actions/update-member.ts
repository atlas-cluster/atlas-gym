'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

import { getSession } from '@/features/auth'
import { memberDetailsSchema } from '@/features/members/schemas/member-details'
import { pool } from '@/features/shared/lib/db'
import { PG_UNIQUE_VIOLATION } from '@/features/shared/lib/postgres-errors'

export async function updateMember(
  id: string,
  data: z.infer<typeof memberDetailsSchema>,
  lastUpdatedAt: Date
): Promise<{
  success: boolean
  message: string
  errorType?:
    | 'AUTH'
    | 'NOT_FOUND'
    | 'VERSION_MISMATCH'
    | 'EMAIL_COLLISION'
    | 'VALIDATION'
    | 'UNKNOWN'
}> {
  try {
    const { member } = await getSession()

    if (!member) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Unauthorized. Please log in to update a member.',
      }
    }

    if (member.id !== id && !member.isTrainer) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'You do not have permission to update this member.',
      }
    }

    const validated = memberDetailsSchema.parse(data)

    const result = await pool.query(
      `WITH target_member AS (
        SELECT id,
               (date_trunc('milliseconds', updated_at) = $9::timestamptz) AS version_match
        FROM members WHERE id = $8
      ),
      updated_member AS (
        UPDATE members
          SET firstname = $1, lastname = $2, middlename = $3, email = $4, phone = $5, address = $6, birthdate = $7, updated_at = NOW()
          WHERE id = $8
            AND (SELECT version_match FROM target_member) = true
          RETURNING id, firstname, lastname
      ),
      log_member AS (
        INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
        SELECT $10, 'Update'::action_type, id, 'member', 'Member updated: ' || firstname || ' ' || lastname
        FROM updated_member
      )
      SELECT
        (SELECT COUNT(*) FROM target_member) AS found,
        (SELECT version_match FROM target_member) AS version_match,
        (SELECT id FROM updated_member) AS updated_id`,
      [
        validated.firstname,
        validated.lastname,
        validated.middlename ?? null,
        validated.email,
        validated.phone ?? null,
        validated.address ?? null,
        validated.birthdate,
        id,
        lastUpdatedAt,
        member.id,
      ]
    )

    const row = result.rows[0]

    if (parseInt(row.found) === 0) {
      return {
        success: false,
        errorType: 'NOT_FOUND',
        message: 'Member not found.',
      }
    }

    if (!row.version_match) {
      return {
        success: false,
        errorType: 'VERSION_MISMATCH',
        message:
          'Member was modified by another user. Please refresh and try again.',
      }
    }

    updateTag('members')

    return { success: true, message: 'Member updated successfully.' }
  } catch (error: unknown) {
    if (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === PG_UNIQUE_VIOLATION
    ) {
      return {
        success: false,
        errorType: 'EMAIL_COLLISION',
        message: 'A member with this email already exists.',
      }
    }
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errorType: 'VALIDATION',
        message: 'Invalid input data. Please check the form and try again.',
      }
    }
    console.error('[UPDATE_MEMBER_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An unexpected error occurred.',
    }
  }
}
