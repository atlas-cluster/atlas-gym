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
    const versionString = result[0]?.version || 'Unknown'
    
    // Extract PostgreSQL version using regex
    const versionMatch = versionString.match(/PostgreSQL [\d.]+/)
    const version = versionMatch ? versionMatch[0] : 'PostgreSQL (Unknown version)'
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
      database: {
        type: 'PostgreSQL',
        version: version,
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
