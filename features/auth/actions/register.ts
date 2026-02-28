'use server'

import bcrypt from 'bcryptjs'
import { updateTag } from 'next/cache'
import { cookies } from 'next/headers'
import { z } from 'zod'

import { registerSchema } from '@/features/auth/schemas/register'
import { pool } from '@/features/shared/lib/db'
import { PG_UNIQUE_VIOLATION } from '@/features/shared/lib/postgres-errors'

export async function register(data: z.infer<typeof registerSchema>): Promise<{
  success: boolean
  message: string
  errorType?: 'EMAIL_ALREADY_EXISTS' | 'VALIDATION' | 'UNKNOWN'
}> {
  try {
    const validated = registerSchema.parse(data)

    const hashedPassword = await bcrypt.hash(validated.password, 10)

    const isCreditCard = validated.paymentType === 'credit_card'
    const sanitizedExpiry = isCreditCard
      ? (validated.cardExpiry || '').replace(/\D/g, '')
      : null
    const sanitizedIban = isCreditCard
      ? null
      : (validated.iban || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase()

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const result = await pool.query<{ session_id: string }>(
      `WITH new_member AS (
        INSERT INTO members (
          email, password_hash, firstname, lastname, middlename,
          address, birthdate, phone, payment_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      ),
      insert_credit_card AS (
        INSERT INTO credit_cards (member_id, card_number, card_holder, card_expiry, card_cvc)
        SELECT nm.id, $10, $11, $12, $13
        FROM new_member nm
        WHERE $14 = true
      ),
      insert_bank_account AS (
        INSERT INTO bank_accounts (member_id, iban)
        SELECT nm.id, $15
        FROM new_member nm
        WHERE $14 = false
      ),
      new_session AS (
        INSERT INTO sessions (member_id, expires_at)
        SELECT nm.id, $16
        FROM new_member nm
        RETURNING id, member_id
      ),
      log_register AS (
        INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
        SELECT nm.id, 'Create'::action_type, nm.id, 'member', $17
        FROM new_member nm
      ),
      log_login AS (
        INSERT INTO audit_logs (member_id, action, entity_id, entity_type, description)
        SELECT ns.member_id, 'Create'::action_type, ns.id, 'session', 'Member logged in (auto)'
        FROM new_session ns
      )
      SELECT id AS session_id FROM new_session`,
      [
        validated.email, // $1
        hashedPassword, // $2
        validated.firstname, // $3
        validated.lastname, // $4
        validated.middlename || null, // $5
        validated.address, // $6
        validated.birthdate, // $7
        validated.phone, // $8
        validated.paymentType, // $9
        validated.cardNumber ?? null, // $10
        validated.cardHolder ?? null, // $11
        sanitizedExpiry, // $12
        validated.cardCvc ?? null, // $13
        isCreditCard, // $14
        sanitizedIban, // $15
        expiresAt, // $16
        `Member registered: ${validated.firstname} ${validated.lastname}`, // $17
      ]
    )

    const sessionId = result.rows[0].session_id

    updateTag('members')

    const cookieStore = await cookies()
    cookieStore.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    })

    return {
      success: true,
      message: 'Account created successfully.',
    }
  } catch (error: unknown) {
    if (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === PG_UNIQUE_VIOLATION
    ) {
      return {
        success: false,
        errorType: 'EMAIL_ALREADY_EXISTS',
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
    console.error('[REGISTER_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An unexpected error occurred. Please try again later.',
    }
  }
}
