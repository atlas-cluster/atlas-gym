#!/usr/bin/env node

/**
 * Database Migration Runner
 * 
 * This script runs database migrations using node-pg-migrate.
 * It can be used in development, production, and Docker environments.
 * 
 * Usage:
 *   node scripts/migrate.js up    - Run all pending migrations
 *   node scripts/migrate.js down  - Rollback the last migration
 *   node scripts/migrate.js       - Show migration status
 */

const { execSync } = require('child_process')

// Build DATABASE_URL from environment variables if not already set
if (!process.env.DATABASE_URL) {
  const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_DB, POSTGRES_PORT } = process.env
  
  if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_HOST || !POSTGRES_DB) {
    console.error('Error: Missing required database environment variables')
    console.error('Required: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_DB')
    console.error('Or set DATABASE_URL directly')
    process.exit(1)
  }
  
  const port = POSTGRES_PORT || '5432'
  process.env.DATABASE_URL = `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${port}/${POSTGRES_DB}`
}

const command = process.argv[2] || 'list'

console.log('Running migrations...')
console.log(`Command: ${command}`)
console.log(`Database: ${process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@')}`)
console.log('')

try {
  const npxCommand = `npx node-pg-migrate ${command}`
  execSync(npxCommand, { stdio: 'inherit' })
  console.log('\n✅ Migration completed successfully')
} catch (error) {
  console.error('\n❌ Migration failed')
  process.exit(1)
}
