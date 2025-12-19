import { NextRequest, NextResponse } from 'next/server'
import { getUserBySessionId } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value

    if (!sessionId) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      )
    }

    const user = await getUserBySessionId(sessionId)

    if (!user) {
      // Invalid/expired session - clear the cookie
      const response = NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      )
      response.cookies.delete('session')
      return response
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: user.id,
          email: user.user_email,
          firstname: user.user_firstname,
          lastname: user.user_lastname,
          middlename: user.user_middlename,
          birthdate: user.user_birthdate,
          address: user.user_address,
          phone: user.user_phone,
          isTrainer: user.isTrainer || false,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
