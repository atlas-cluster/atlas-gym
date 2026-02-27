'use server'

import { updateTag } from 'next/cache'

import { getSession } from '@/features/auth'
import { pool } from '@/features/shared/lib/db'

export async function deleteMembers(ids: string[]): Promise<{
  success: boolean
  message: string
  errorType?: 'AUTH' | 'VALIDATION' | 'SELF_DELETE' | 'UNKNOWN'
}> {
  const client = await pool.connect()
  try {
    const { member } = await getSession()

    if (!member) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Unauthorized. Please log in to delete members.',
      }
    }

    if (!member.isTrainer) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Only trainers can delete members.',
      }
    }

    if (ids.length === 0) {
      return {
        success: false,
        errorType: 'VALIDATION',
        message: 'No members selected for deletion.',
      }
    }

    if (ids.includes(member.id)) {
      return {
        success: false,
        errorType: 'SELF_DELETE',
        message: 'You cannot delete your own account.',
      }
    }

    await client.query('BEGIN')

    const result = await client.query(
      `WITH target_members AS (
        SELECT id, firstname, lastname
        FROM members
        WHERE id = ANY($1::uuid[])
        FOR UPDATE
      ),
      deleted_members AS (
        DELETE FROM members
        WHERE id = ANY($1::uuid[])
        RETURNING id
      ),
      log_members AS (
        INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
        SELECT $2, 'Delete'::action_type, tm.id, 'member',
          'Member ' || tm.firstname || ' ' || tm.lastname || ' deleted (bulk)'
        FROM target_members tm
        WHERE tm.id IN (SELECT id FROM deleted_members)
      )
      SELECT
        (SELECT COUNT(*) FROM target_members) AS found,
        (SELECT COUNT(*) FROM deleted_members) AS deleted_count`,
      [ids, member.id]
    )

    const row = result.rows[0]
    const deletedCount = parseInt(row.deleted_count)

    await client.query('COMMIT')

    updateTag('members')

    return {
      success: true,
      message: `${deletedCount} member${deletedCount === 1 ? '' : 's'} deleted successfully.`,
    }
  } catch (error: unknown) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('[DELETE_MEMBERS_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An error occurred while deleting the members.',
    }
  } finally {
    client.release()
  }
}
