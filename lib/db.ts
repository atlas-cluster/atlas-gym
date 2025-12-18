import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './db/schema'

// Disable prefetch as it's not supported for "Transaction" pool mode
const queryClient = postgres({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: 5432,
  database: process.env.POSTGRES_DB,
  idle_timeout: 30,
  connect_timeout: 2,
})

export const db = drizzle(queryClient, { schema })

export async function testConnection(): Promise<{
  success: boolean
  message: string
  details?: unknown
}> {
  try {
    const result = await queryClient`SELECT NOW() as now, version() as version`

    return {
      success: true,
      message: 'Database connection successful',
      details: {
        timestamp: result[0].now,
        version: result[0].version,
      },
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error,
    }
  }
}
