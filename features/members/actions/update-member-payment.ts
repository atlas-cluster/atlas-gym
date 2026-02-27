'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

import { getSession } from '@/features/auth'
import { memberPaymentSchema } from '@/features/members/schemas/member-payment'
import { pool } from '@/features/shared/lib/db'

export async function updateMemberPayment(
  memberId: string,
  data: z.infer<typeof memberPaymentSchema>,
  lastUpdatedAt?: Date
): Promise<{
  success: boolean
  message: string
  errorType?:
    | 'AUTH'
    | 'NOT_FOUND'
    | 'VERSION_MISMATCH'
    | 'VALIDATION'
    | 'UNKNOWN'
}> {
  try {
    const { member } = await getSession()

    if (!member) {
      return {
        success: false,
        errorType: 'AUTH',
        message: 'Unauthorized. Please log in to update payment info.',
      }
    }

    if (member.id !== memberId && !member.isTrainer) {
      return {
        success: false,
        errorType: 'AUTH',
        message:
          'You do not have permission to update payment info for this member.',
      }
    }

    const validated = memberPaymentSchema.parse(data)
    const isSelf = member.id === memberId
    const isCreditCard = validated.paymentType === 'credit_card'
    const sanitizedExpiry = isCreditCard
      ? (validated.cardExpiry || '').replace(/\s/g, '')
      : null
    const sanitizedIban = isCreditCard
      ? null
      : (validated.iban || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase()

    const result = await pool.query(
      `WITH target_member AS (
        -- Fetch member and check optimistic lock version
        SELECT id, firstname, lastname,
               CASE WHEN $3::timestamptz IS NULL THEN true
                    ELSE (date_trunc('milliseconds', updated_at) = $3::timestamptz)
               END AS version_match
        FROM members WHERE id = $2
        FOR UPDATE
      ),
      updated_member AS (
        -- Update payment type only if version matches
        UPDATE members
          SET payment_type = $1, updated_at = NOW()
          WHERE id = $2
            AND (SELECT version_match FROM target_member) = true
          RETURNING id
      ),
      -- Remove old bank account when switching to credit card
      delete_bank AS (
        DELETE FROM bank_accounts
        WHERE member_id = $2 AND $4 = true
          AND EXISTS (SELECT 1 FROM updated_member)
      ),
      -- Upsert credit card details when payment type is credit card
      upsert_credit AS (
        INSERT INTO credit_cards (member_id, card_number, card_holder, card_expiry, card_cvc)
        SELECT $2, $5, $6, $7, $8
        WHERE $4 = true AND EXISTS (SELECT 1 FROM updated_member)
        ON CONFLICT (member_id)
        DO UPDATE SET card_number = $5, card_holder = $6, card_expiry = $7, card_cvc = $8, updated_at = NOW()
      ),
      -- Remove old credit card when switching to bank account
      delete_credit AS (
        DELETE FROM credit_cards
        WHERE member_id = $2 AND $4 = false
          AND EXISTS (SELECT 1 FROM updated_member)
      ),
      -- Upsert bank account details when payment type is iban
      upsert_bank AS (
        INSERT INTO bank_accounts (member_id, iban)
        SELECT $2, $9
        WHERE $4 = false AND EXISTS (SELECT 1 FROM updated_member)
        ON CONFLICT (member_id)
        DO UPDATE SET iban = $9, updated_at = NOW()
      ),
      log_change AS (
        INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
        SELECT $10, 'Update'::action_type, um.id, 'member',
          CASE WHEN $11 THEN 'Payment info updated'
               ELSE 'Payment info for ' || tm.firstname || ' ' || tm.lastname || ' updated'
          END
        FROM updated_member um, target_member tm
      )
      SELECT
        (SELECT COUNT(*) FROM target_member) AS found,
        (SELECT version_match FROM target_member) AS version_match,
        (SELECT id FROM updated_member) AS updated_id`,
      [
        validated.paymentType, // $1
        memberId, // $2
        lastUpdatedAt ?? null, // $3
        isCreditCard, // $4
        validated.cardNumber ?? null, // $5
        validated.cardHolder ?? null, // $6
        sanitizedExpiry, // $7
        validated.cardCvc ?? null, // $8
        sanitizedIban, // $9
        member.id, // $10
        isSelf, // $11
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

    return {
      success: true,
      message: 'Payment info updated successfully.',
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errorType: 'VALIDATION',
        message: 'Invalid input data. Please check the form and try again.',
      }
    }
    console.error('[UPDATE_PAYMENT_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An unexpected error occurred.',
    }
  }
}
