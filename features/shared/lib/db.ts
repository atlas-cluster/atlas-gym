import { Pool } from 'pg'

const globalForPg = globalThis as typeof globalThis & {
  pgPool?: Pool
}

export const pool =
  globalForPg.pgPool ??
  new Pool({
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: 5432,
    ssl: false,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPg.pgPool = pool
}
