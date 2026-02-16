'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

import { createAuditLog } from '@/features/audit-logs'
import { getSession } from '@/features/auth'
import { memberPaymentSchema } from '@/features/members/schemas/member-payment'
import { pool } from '@/features/shared/lib/db'

export async function updateMemberPayment(
  id: string,
  data: z.infer<typeof memberPaymentSchema>
) {
  const result = await pool.query(
    'SELECT firstname, lastname FROM members WHERE id = $1',
    [id]
  )
  const targetName = result.rows[0]
    ? `${result.rows[0].firstname} ${result.rows[0].lastname}`
    : 'Unknown member'

  const validation = memberPaymentSchema.safeParse(data)

  if (!validation.success) {
    throw new Error('Invalid payment data')
  }

  const { paymentType, cardNumber, cardExpiry, cardCvc, cardHolder, iban } =
    validation.data

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    await client.query(`UPDATE members SET payment_type = $2 WHERE id = $1`, [
      id,
      paymentType,
    ])

    await client.query('DELETE FROM credit_cards WHERE member_id = $1', [id])
    await client.query('DELETE FROM bank_accounts WHERE member_id = $1', [id])

    if (paymentType === 'credit_card') {
      const cleanExpiry = (cardExpiry || '').replace(/\D/g, '')

      await client.query(
        `INSERT INTO credit_cards (
           member_id,
           card_number,
           card_expiry,
           card_cvc,
           card_holder
         ) VALUES ($1, $2, $3, $4, $5)`,
        [id, cardNumber, cleanExpiry, cardCvc, cardHolder]
      )
    } else {
      const cleanIban = (iban || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase()

      await client.query(
        `INSERT INTO bank_accounts (
           member_id,
           iban
         ) VALUES ($1, $2)`,
        [id, cleanIban]
      )
    }

    const { member } = await getSession()

    if (member) {
      await createAuditLog({
        client,
        memberId: member.id,
        action: 'Update',
        entityId: id,
        entityType: 'member',
        description: `Payment method updated to ${paymentType} for ${targetName}`,
      })
    }

    await client.query('COMMIT')
    updateTag('members')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
