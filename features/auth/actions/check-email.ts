'use server'

import { z } from 'zod'

import { pool } from '@/features/shared/lib/db'
import { emailSchema } from '@/features/shared/schemas/email'

export async function checkEmail(email: z.infer<typeof emailSchema>): Promise<{
  success: boolean
  message: string
  errorType?: 'EMAIL_ALREADY_EXISTS' | 'VALIDATION' | 'UNKNOWN'
}> {
  try {
    emailSchema.parse(email)

    const { rows } = await pool.query(
      'SELECT 1 FROM members WHERE email = $1',
      [email]
    )

    if (rows.length > 0) {
      return {
        success: false,
        errorType: 'EMAIL_ALREADY_EXISTS',
        message: 'A member with this email already exists.',
      }
    }

    return {
      success: true,
      message: 'Email is available.',
    }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errorType: 'VALIDATION',
        message: 'Invalid email address.',
      }
    }
    console.error('[CHECK_EMAIL_ERROR]:', error)
    return {
      success: false,
      errorType: 'UNKNOWN',
      message: 'An error occurred while checking the email.',
    }
  }
}
