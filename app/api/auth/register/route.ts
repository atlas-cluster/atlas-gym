import { NextRequest, NextResponse } from 'next/server'
import { createUser, createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const {
      email,
      password,
      firstname,
      lastname,
      birthdate,
      middlename,
      address,
      phone,
      paymentType,
      paymentInfo,
    } = body

    if (!email || !password || !firstname || !lastname || !birthdate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Create user
    const user = await createUser({
      email,
      password,
      firstname,
      lastname,
      middlename,
      birthdate,
      address,
      phone,
      paymentType,
      paymentInfo,
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user. Email might already be in use.' },
        { status: 400 }
      )
    }

    // Create session
    const session = await createSession(user.id)

    if (!session) {
      return NextResponse.json(
        { error: 'User created but failed to create session' },
        { status: 500 }
      )
    }

    // Create response with session cookie
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
      { status: 201 }
    )

    // Set session cookie
    response.cookies.set('session', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
