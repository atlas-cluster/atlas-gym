import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test the database connection by running a simple query
    const result = await prisma.$queryRaw<
      { now: Date }[]
    >`SELECT NOW() as now`

    // Create a health check record
    const healthCheck = await prisma.healthCheck.create({
      data: {
        status: 'connected',
      },
    })

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      timestamp: result[0].now,
      healthCheckId: healthCheck.id,
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
