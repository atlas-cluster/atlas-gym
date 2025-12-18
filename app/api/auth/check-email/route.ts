import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const sql = getPool()
    const result = await sql`
      SELECT id FROM gym_manager.users WHERE user_email = ${email}
    `

    const exists = result.length > 0

    return NextResponse.json({ exists }, { status: 200 })
  } catch (err) {
    console.error('Check email error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
