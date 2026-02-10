'use server'

import { cookies } from 'next/headers'
import { cache } from 'react'

import { User } from '@/features/auth/types'
import { pool } from '@/features/shared/lib/db'

export const getSession = cache(
  async (): Promise<{
    authenticated: boolean
    user: User | null
  }> => {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value

    if (!sessionId) {
      return { authenticated: false, user: null }
    }

    try {
      const query = `
      SELECT 
        u.id, 
        u.email, 
        u.firstname, 
        u.lastname, 
        u.middlename, 
        u.address, 
        u.birthdate, 
        u.phone,
        u.created_at,
        CASE WHEN t.id IS NOT NULL THEN true ELSE false END as is_trainer
      FROM gym_manager.sessions s
      JOIN gym_manager.users u ON s.user_id = u.id
      LEFT JOIN gym_manager.trainers t ON u.id = t.user_id
      WHERE s.id = $1 AND s.expires_at > NOW()
    `

      const result = await pool.query(query, [sessionId])

      if (result.rows.length === 0) {
        return { authenticated: false, user: null }
      }

      const row = result.rows[0]

      const user: User = {
        id: row.id,
        email: row.email,
        firstname: row.firstname,
        lastname: row.lastname,
        middlename: row.middlename || undefined,
        address: row.address || undefined,
        birthdate: row.birthdate,
        phone: row.phone || undefined,
        created_at: row.created_at,
        isTrainer: row.is_trainer,
      }

      return { authenticated: true, user }
    } catch (error) {
      console.error('Error getting session:', error)
      return { authenticated: false, user: null }
    }
  }
)
