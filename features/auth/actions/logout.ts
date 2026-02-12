'use server'

import { cookies } from 'next/headers'

import { pool } from '@/features/shared/lib/db'

export async function logout() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session')?.value

  if (sessionId) {
    try {
      await pool.query('DELETE FROM sessions WHERE id = $1', [sessionId])
    } catch (error) {
      console.error('Error removing session:', error)
    }
  }

  cookieStore.delete('session')
}
