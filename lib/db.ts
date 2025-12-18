import postgres from 'postgres'

let sql: ReturnType<typeof postgres> | null = null

export function getPool() {
  if (!sql) {
    sql = postgres({
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      host: process.env.POSTGRES_HOST,
      port: 5432,
      database: process.env.POSTGRES_DB,
      idle_timeout: 30, // seconds (was 30000ms in pg)
      connect_timeout: 2, // seconds (was 2000ms in pg)
    })
  }
  return sql
}

export async function testConnection(): Promise<{
  success: boolean
  message: string
  details?: unknown
}> {
  try {
    const sql = getPool()
    const result =
      await sql`SELECT NOW() as now, version() as version, pg_postmaster_start_time() as uptime`

    return {
      success: true,
      message: 'Database connection successful',
      details: {
        timestamp: result[0].now,
        version: result[0].version,
        uptime: result[0].uptime,
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
