import { NextResponse } from 'next/server'
import { testConnection } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check database connectivity
    const dbResult = await testConnection()

    if (!dbResult.success) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          checks: {
            database: {
              status: 'fail',
              message: dbResult.message,
            },
          },
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        status: 'healthy',
        checks: {
          database: {
            status: 'pass',
            message: 'Database connection successful',
          },
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        checks: {
          database: {
            status: 'fail',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        },
      },
      { status: 503 }
    )
  }
}
