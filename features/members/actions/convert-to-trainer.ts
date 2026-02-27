'use server'

import { updateTag } from 'next/cache'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function convertToTrainer(
  id: string,
  lastUpdatedAt: Date
): Promise<{
  success: boolean
  message: string
  errorType?:
    | 'AUTH'
    | 'NOT_FOUND'
    | 'VERSION_MISMATCH'
    | 'ALREADY_TRAINER'
    | 'UNKNOWN'
}> {
  try {
    const { member } = await getSession()

    if (!member) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Unauthorized. Please log in to convert a member.',
      }
    }

    if (!member.isTrainer) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Only trainers can promote members to trainers.',
      }
    }

    const result = await pool.query(
      `WITH target_member AS (
        SELECT id, firstname, lastname,
               (date_trunc('milliseconds', updated_at) = $3::timestamptz) AS version_match
        FROM members WHERE id = $1
        FOR UPDATE
      ),
      existing_trainer AS (
        SELECT member_id FROM trainers WHERE member_id = $1
      ),
      inserted_trainer AS (
        INSERT INTO trainers (member_id)
        SELECT $1
        WHERE (SELECT version_match FROM target_member) = true
          AND NOT EXISTS (SELECT 1 FROM existing_trainer)
        RETURNING member_id
      ),
      update_timestamp AS (
        UPDATE members SET updated_at = NOW()
        WHERE id = $1
          AND EXISTS (SELECT 1 FROM inserted_trainer)
        RETURNING id
      ),
      log_change AS (
        INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
        SELECT $2, 'Update'::action_type, it.member_id, 'member',
          tm.firstname || ' ' || tm.lastname || ' promoted to trainer'
        FROM inserted_trainer it, target_member tm
      )
      SELECT
        (SELECT COUNT(*) FROM target_member) AS found,
        (SELECT version_match FROM target_member) AS version_match,
        (SELECT COUNT(*) FROM existing_trainer) AS already_trainer,
        (SELECT COUNT(*) FROM inserted_trainer) AS promoted`,
      [id, member.id, lastUpdatedAt]
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

    if (parseInt(row.already_trainer) > 0) {
      return {
        success: false,
        errorType: 'ALREADY_TRAINER',
        message: 'This member is already a trainer.',
      }
    }

    updateTag('members')

    return {
      success: true,
      message: 'Member promoted to trainer successfully.',
    }
  } catch (error: unknown) {
    console.error('[CONVERT_TO_TRAINER_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An error occurred while promoting the member to trainer.',
    }
  }
}
