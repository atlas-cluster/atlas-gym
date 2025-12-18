import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const result = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.userEmail, email))

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
