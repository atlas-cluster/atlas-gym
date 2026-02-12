'use server'

import { z } from 'zod'

import { CheckEmailError } from '@/features/auth/types'
import { pool } from '@/features/shared/lib/db'
import { emailSchema } from '@/features/shared/schemas/email'

export async function checkEmail(
  email: z.infer<typeof emailSchema>
): Promise<{ error: CheckEmailError } | void> {
  const result = emailSchema.safeParse(email)

  if (!result.success) {
    return { error: 'INVALID_EMAIL' }
  }

  try {
    const { rows } = await pool.query(
      'SELECT 1 FROM members WHERE email = $1',
      [email]
    )

    if (rows.length > 0) {
      return { error: 'EMAIL_ALREADY_EXISTS' }
    }
  } catch (error) {
    console.error('Check email error:', error)
    return { error: 'UNKNOWN_ERROR' }
  }
}
