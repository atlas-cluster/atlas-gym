'use server'

import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

import { registerSchema } from '@/features/auth/schemas/register'
import { pool } from '@/features/shared/lib/db'

export async function register(data: z.infer<typeof registerSchema>) {
  const validation = registerSchema.safeParse(data)

  if (!validation.success) {
    return { error: 'Invalid form data' }
  }

  const {
    email,
    password,
    firstname,
    lastname,
    middlename,
    address,
    birthdate,
    phone,
    paymentType,
    cardNumber,
    cardExpiry,
    cardCvc,
    cardHolder,
    iban,
  } = validation.data

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 1. Check if email exists
    const existing = await client.query(
      `SELECT id FROM gym_manager.members WHERE email = $1`,
      [email]
    )

    if (existing.rows.length > 0) {
      await client.query('ROLLBACK')
      return { error: 'Email already taken' }
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // 3. Insert member
    const insertResult = await client.query<{ id: string }>(
      `INSERT INTO gym_manager.members (
        email, 
        password_hash, 
        firstname, 
        lastname, 
        middlename, 
        address, 
        birthdate, 
        phone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id`,
      [
        email,
        hashedPassword,
        firstname,
        lastname,
        middlename || null,
        address,
        birthdate,
        phone,
      ]
    )

    const memberId = insertResult.rows[0].id

    // 4. Insert payment method
    const paymentMethodResult = await client.query<{ id: string }>(
      `INSERT INTO gym_manager.payment_methods (member_id, type)
         VALUES ($1, $2)
         RETURNING id`,
      [memberId, paymentType]
    )

    const paymentMethodId = paymentMethodResult.rows[0].id

    if (paymentType === 'credit_card') {
      // Remove whitespace from expiry
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
    } else if (paymentType === 'iban') {
      await client.query(
        `INSERT INTO gym_manager.bank_accounts (
             payment_method_id,
             iban
           ) VALUES ($1, $2)`,
        [paymentMethodId, iban]
      )
    }

    // 5. Create session (valid for 7 days)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const sessionResult = await client.query<{ id: string }>(
      `INSERT INTO gym_manager.sessions (member_id, expires_at) 
       VALUES ($1, $2) 
       RETURNING id`,
      [memberId, expiresAt]
    )

    const sessionId = sessionResult.rows[0].id

    await client.query('COMMIT')

    // 6. Set cookie
    const cookieStore = await cookies()
    cookieStore.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Registration error:', error)
    return { error: 'Failed to create account' }
  } finally {
    client.release()
  }
}
