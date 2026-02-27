'use server'

import bcrypt from 'bcryptjs'
import { updateTag } from 'next/cache'
import { z } from 'zod'

import { getSession } from '@/features/auth'
import { memberPasswordSchema } from '@/features/members/schemas/member-password'
import { pool } from '@/features/shared/lib/db'

export async function updateMemberPassword(
  memberId: string,
  data: z.infer<typeof memberPasswordSchema>
): Promise<{
  success: boolean
  message: string
  errorType?: 'AUTH' | 'NOT_FOUND' | 'VALIDATION' | 'UNKNOWN'
}> {
  try {
    const { member } = await getSession()

    if (!member) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Unauthorized. Please log in to update password.',
      }
    }

    if (member.id !== memberId && !member.isTrainer) {
      return {
        success: false,
        errorType: 'AUTH',
        message:
          'You do not have permission to update the password for this member.',
      }
    }

    const validated = memberPasswordSchema.parse(data)
    const hashedPassword = await bcrypt.hash(validated.password, 10)

    const result = await pool.query(
      `WITH target_member AS (
        SELECT id, firstname, lastname FROM members WHERE id = $2
        FOR UPDATE
      ),
      updated_member AS (
        UPDATE members
          SET password_hash = $1, updated_at = NOW()
          WHERE id = $2
          RETURNING id
      ),
      log_change AS (
        INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
        SELECT $3, 'Update'::action_type, um.id, 'member',
          CASE WHEN $4 THEN 'Password updated'
               ELSE 'Password for ' || tm.firstname || ' ' || tm.lastname || ' updated'
          END
        FROM updated_member um, target_member tm
      )
      SELECT
        (SELECT COUNT(*) FROM target_member) AS found,
        (SELECT id FROM updated_member) AS updated_id`,
      [hashedPassword, memberId, member.id, member.id === memberId]
    )

    const row = result.rows[0]

    if (parseInt(row.found) === 0) {
      return {
        success: false,
        errorType: 'NOT_FOUND',
        message: 'Member not found.',
      }
    }

    updateTag('members')

    return {
      success: true,
      message: 'Password updated successfully.',
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errorType: 'VALIDATION',
        message: 'Invalid input data.',
      }
    }
    console.error('[UPDATE_PASSWORD_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An unexpected error occurred.',
    }
  }
}
