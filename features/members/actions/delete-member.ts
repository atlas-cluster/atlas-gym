'use server'

import { updateTag } from 'next/cache'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function deleteMember(
  id: string,
  lastUpdatedAt: Date
): Promise<{
  success: boolean
  message: string
  errorType?:
    | 'AUTH'
    | 'NOT_FOUND'
    | 'VERSION_MISMATCH'
    | 'SELF_DELETE'
    | 'UNKNOWN'
}> {
  try {
    const { member } = await getSession()

    if (!member) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Unauthorized. Please log in to delete a member.',
      }
    }

    if (!member.isTrainer) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Only trainers can delete members.',
      }
    }

    if (member.id === id) {
      return {
        success: false,
        errorType: 'SELF_DELETE',
        message: 'You cannot delete your own account.',
      }
    }

    const result = await pool.query(
      `WITH target_member AS (
        SELECT id, firstname, lastname,
               (date_trunc('milliseconds', updated_at) = $3::timestamptz) AS version_match
        FROM members WHERE id = $1
        FOR UPDATE
      ),
      deleted_member AS (
        DELETE FROM members
        WHERE id = $1
          AND (SELECT version_match FROM target_member) = true
        RETURNING id
      ),
      log_member AS (
        INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
        SELECT $2, 'Delete'::action_type, dm.id, 'member',
          'Member ' || tm.firstname || ' ' || tm.lastname || ' deleted'
        FROM deleted_member dm, target_member tm
      )
      SELECT
        (SELECT COUNT(*) FROM target_member) AS found,
        (SELECT version_match FROM target_member) AS version_match,
        (SELECT id FROM deleted_member) AS deleted_id`,
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

    updateTag('members')

    return {
      success: true,
      message: 'Member deleted successfully.',
    }
  } catch (error: unknown) {
    console.error('[DELETE_MEMBER_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An error occurred while deleting the member.',
    }
  }
}
