import postgres from 'postgres'

let sql: ReturnType<typeof postgres> | null = null

export function getPool() {
  if (!sql) {
    sql = postgres({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: 5432,
      database: process.env.DB_NAME,
    })
  }
  return sql
}
