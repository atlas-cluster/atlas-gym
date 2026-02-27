'use server'

import { updateTag } from 'next/cache'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function convertToMember(
  id: string,
  lastUpdatedAt: Date
): Promise<{
  success: boolean
  message: string
  errorType?:
    | 'AUTH'
    | 'NOT_FOUND'
    | 'VERSION_MISMATCH'
    | 'NOT_TRAINER'
    | 'SELF_DEMOTE'
    | 'UNKNOWN'
}> {
  try {
    const { member } = await getSession()

    if (!member) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Unauthorized. Please log in to convert a trainer.',
      }
    }

    if (!member.isTrainer) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Only trainers can demote trainers to members.',
      }
    }

    if (member.id === id) {
      return {
        success: false,
        errorType: 'SELF_DEMOTE',
        message: 'You cannot demote yourself.',
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
        FOR UPDATE
      ),
      deleted_trainer AS (
        DELETE FROM trainers
        WHERE member_id = $1
          AND (SELECT version_match FROM target_member) = true
          AND EXISTS (SELECT 1 FROM existing_trainer)
        RETURNING member_id
      ),
      update_timestamp AS (
        UPDATE members SET updated_at = NOW()
        WHERE id = $1
          AND EXISTS (SELECT 1 FROM deleted_trainer)
        RETURNING id
      ),
      log_change AS (
        INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
        SELECT $2, 'Update'::action_type, dt.member_id, 'member',
          tm.firstname || ' ' || tm.lastname || ' demoted to member'
        FROM deleted_trainer dt, target_member tm
      )
      SELECT
        (SELECT COUNT(*) FROM target_member) AS found,
        (SELECT version_match FROM target_member) AS version_match,
        (SELECT COUNT(*) FROM existing_trainer) AS is_trainer,
        (SELECT COUNT(*) FROM deleted_trainer) AS demoted`,
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

    if (parseInt(row.is_trainer) === 0) {
      return {
        success: false,
        errorType: 'NOT_TRAINER',
        message: 'This member is not a trainer.',
      }
    }

    updateTag('members')

    return {
      success: true,
      message: 'Trainer demoted to member successfully.',
    }
  } catch (error: unknown) {
    console.error('[CONVERT_TO_MEMBER_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An error occurred while demoting the trainer to member.',
    }
  }
}
