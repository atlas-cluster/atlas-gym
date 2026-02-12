'use server'

import { cookies } from 'next/headers'
import { cache } from 'react'

import { Member } from '@/features/members'
import { pool } from '@/features/shared/lib/db'

export const getSession = cache(
  async (): Promise<{
    authenticated: boolean
    member: Member | null
  }> => {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value

    if (!sessionId) {
      return { authenticated: false, member: null }
    }

    try {
      const query = `
       SELECT 
         m.id, 
         m.email, 
         m.firstname, 
         m.lastname, 
         m.middlename, 
         m.address, 
         m.birthdate, 
         m.phone,
         m.created_at,
        CASE WHEN t.id IS NOT NULL THEN true ELSE false END as is_trainer
       FROM gym_manager.sessions s
       JOIN gym_manager.members m ON s.member_id = m.id
       LEFT JOIN gym_manager.trainers t ON m.id = t.member_id
       WHERE s.id = $1 AND s.expires_at > NOW()
     `

      const result = await pool.query(query, [sessionId])

      if (result.rows.length === 0) {
        return { authenticated: false, member: null }
      }

      const row = result.rows[0]

      const member: Member = {
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

      return { authenticated: true, member }
    } catch (error) {
      console.error('Error getting session:', error)
      return { authenticated: false, member: null }
    }
  }
)
