import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, createSession } from '@/lib/auth'
import { loginSchema } from '@/lib/schemas'
import { getSecureCookieOptions } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate and sanitize input
    const validation = loginSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Authenticate user
    const authResult = await authenticateUser(email, password)

    if (authResult.user === null) {
      if (authResult.error === 'NOT_FOUND') {
        return NextResponse.json(
          { error: 'Email does not exist' },
          { status: 404 }
        )
      }
      if (authResult.error === 'INVALID_PASSWORD') {
        return NextResponse.json(
          { error: 'Incorrect password' },
          { status: 401 }
        )
      }
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      )
    }
    const user = authResult.user
    const session = await createSession(user.id)

    if (!session) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.user_email,
          firstname: user.user_firstname,
          lastname: user.user_lastname,
        },
      },
      { status: 200 }
    )

    response.cookies.set('session', session.id, getSecureCookieOptions())

    return response
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
