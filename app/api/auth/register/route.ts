import { NextRequest, NextResponse } from 'next/server'
import { createUser, createSession } from '@/lib/auth'
import { registrationSchema } from '@/lib/schemas'
import { getSecureCookieOptions } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('Registration attempt with data:', {
      email: body.email,
      birthdate: body.birthdate,
      paymentType: body.paymentType,
    })

    // Validate and sanitize input
    const validation = registrationSchema.safeParse(body)

    if (!validation.success) {
      console.error('Validation failed:', validation.error.issues)
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

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
    } = validation.data

    // Create user
    let user
    try {
      user = await createUser({
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
    } catch (createUserError) {
      // Check if it's a duplicate email error (PostgreSQL unique constraint violation)
      const pgError = createUserError as {
        code?: string
        constraint?: string
        detail?: string
      }
      if (
        pgError.code === '23505' &&
        pgError.constraint === 'users_user_email_key'
      ) {
        return NextResponse.json(
          { error: 'This email is already registered' },
          { status: 400 }
        )
      }
      // Log detailed error information for debugging
      console.error('Error creating user:', createUserError)
      console.error('Error details:', {
        code: pgError.code,
        constraint: pgError.constraint,
        detail: pgError.detail,
      })
      return NextResponse.json(
        {
          error:
            'Failed to create user. Please check your information and try again.',
        },
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

    // Set secure session cookie
    response.cookies.set('session', session.id, getSecureCookieOptions())

    return response
  } catch (err) {
    console.error('Registration error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
