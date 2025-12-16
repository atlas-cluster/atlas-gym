import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const pool = getPool()
    const result = await pool.query(
      'SELECT id FROM gym_manager.users WHERE user_email = $1',
      [email]
    )

    const exists = result.rows.length > 0

    return NextResponse.json({ exists }, { status: 200 })
  } catch (err) {
    console.error('Check email error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
