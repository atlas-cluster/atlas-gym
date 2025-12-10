import { Pool } from 'pg'

let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      user: process.env.POSTGRES_USER || 'atlas_user',
      password: process.env.POSTGRES_PASSWORD || 'atlas_password',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'atlas_gym',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  }
  return pool
}

export async function testConnection(): Promise<{
  success: boolean
  message: string
  details?: unknown
}> {
  try {
    const pool = getPool()
    const client = await pool.connect()
    const result = await client.query('SELECT NOW(), version()')
    client.release()

    return {
      success: true,
      message: 'Database connection successful',
      details: {
        timestamp: result.rows[0].now,
        version: result.rows[0].version,
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
