import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    // Try to connect to the database
    await prisma.$connect()
    
    // Execute a simple query to verify connection
    await prisma.$queryRaw`SELECT 1`
    
    // Get database info
    const result = await prisma.$queryRaw`SELECT version()` as any[]
    const version = result[0]?.version || 'Unknown'
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
      database: {
        type: 'PostgreSQL',
        version: version.split(' ')[0] + ' ' + version.split(' ')[1],
      },
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
