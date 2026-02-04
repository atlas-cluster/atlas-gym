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
