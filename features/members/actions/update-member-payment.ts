'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

import { memberPaymentSchema } from '@/features/members/schemas/member-payment'
import { pool } from '@/features/shared/lib/db'

export async function updateMemberPayment(
  id: string,
  data: z.infer<typeof memberPaymentSchema>
) {
  const validation = memberPaymentSchema.safeParse(data)

  if (!validation.success) {
    throw new Error('Invalid payment data')
  }

  const { paymentType, cardNumber, cardExpiry, cardCvc, cardHolder, iban } =
    validation.data

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const existing = await client.query<{ id: string }>(
      `SELECT id FROM gym_manager.payment_methods WHERE member_id = $1`,
      [id]
    )

    const existingIds = existing.rows.map((row) => row.id)

    if (existingIds.length > 0) {
      await client.query(
        `DELETE FROM gym_manager.credit_cards WHERE payment_method_id = ANY($1::uuid[])`,
        [existingIds]
      )
      await client.query(
        `DELETE FROM gym_manager.bank_accounts WHERE payment_method_id = ANY($1::uuid[])`,
        [existingIds]
      )
      await client.query(
        `DELETE FROM gym_manager.payment_methods WHERE member_id = $1`,
        [id]
      )
    }

    const paymentMethodResult = await client.query<{ id: string }>(
      `INSERT INTO gym_manager.payment_methods (member_id, type)
       VALUES ($1, $2)
       RETURNING id`,
      [id, paymentType]
    )

    const paymentMethodId = paymentMethodResult.rows[0].id

    if (paymentType === 'credit_card') {
      const cleanExpiry = (cardExpiry || '').replace(/\D/g, '')

      await client.query(
        `INSERT INTO gym_manager.credit_cards (
           payment_method_id,
           card_number,
           card_expiry,
           card_cvc,
           card_holder
         ) VALUES ($1, $2, $3, $4, $5)`,
        [paymentMethodId, cardNumber, cleanExpiry, cardCvc, cardHolder]
      )
    } else {
      const cleanIban = (iban || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase()

      await client.query(
        `INSERT INTO gym_manager.bank_accounts (
           payment_method_id,
           iban
         ) VALUES ($1, $2)`,
        [paymentMethodId, cleanIban]
      )
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
