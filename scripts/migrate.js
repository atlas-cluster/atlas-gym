#!/usr/bin/env node

/**
 * Simple Database Migration Runner
 * 
 * Runs SQL migration files in order and tracks which migrations have been applied.
 * Migration files should be named: 001_description.sql, 002_description.sql, etc.
 * 
 * Usage:
 *   node scripts/migrate.js up      - Run all pending migrations
 *   node scripts/migrate.js status  - Show migration status
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

// Build connection config from environment variables
const config = {
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
}

// Validate required config
if (!config.user || !config.password || !config.database) {
  console.error('Error: Missing required database environment variables')
  console.error('Required: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB')
  console.error('Optional: POSTGRES_HOST (default: localhost), POSTGRES_PORT (default: 5432)')
  process.exit(1)
}

const migrationsDir = path.join(__dirname, '../db/migrations')
const command = process.argv[2] || 'up'

// Create migrations tracking table
async function createMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)
}

// Get all migration files
function getMigrationFiles() {
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()
  
  return files.map(file => {
    const match = file.match(/^(\d+)_(.+)\.sql$/)
    if (!match) {
      throw new Error(`Invalid migration filename: ${file}. Expected format: 001_description.sql`)
    }
    return {
      version: parseInt(match[1]),
      name: match[2],
      filename: file,
      filepath: path.join(migrationsDir, file)
    }
  })
}

// Get applied migrations
async function getAppliedMigrations(client) {
  const result = await client.query('SELECT version FROM schema_migrations ORDER BY version')
  return result.rows.map(row => row.version)
}

// Run a migration
async function runMigration(client, migration) {
  console.log(`Applying migration ${migration.version}: ${migration.name}...`)
  
  const sql = fs.readFileSync(migration.filepath, 'utf8')
  
  try {
    // Run migration in a transaction
    await client.query('BEGIN')
    await client.query(sql)
    await client.query(
      'INSERT INTO schema_migrations (version, name) VALUES ($1, $2)',
      [migration.version, migration.name]
    )
    await client.query('COMMIT')
    console.log(`✓ Migration ${migration.version} applied successfully`)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  }
}

// Show migration status
async function showStatus(client) {
  const allMigrations = getMigrationFiles()
  const appliedVersions = await getAppliedMigrations(client)
  
  console.log('\n=== Migration Status ===\n')
  
  if (allMigrations.length === 0) {
    console.log('No migration files found in', migrationsDir)
    return
  }
  
  allMigrations.forEach(migration => {
    const status = appliedVersions.includes(migration.version) ? '✓ Applied' : '✗ Pending'
    console.log(`${status} | ${migration.version.toString().padStart(3, '0')}_${migration.name}`)
  })
  
  console.log('')
}

// Run all pending migrations
async function runPendingMigrations(client) {
  const allMigrations = getMigrationFiles()
  const appliedVersions = await getAppliedMigrations(client)
  const pending = allMigrations.filter(m => !appliedVersions.includes(m.version))
  
  if (pending.length === 0) {
    console.log('✓ All migrations are up to date')
    return
  }
  
  console.log(`Found ${pending.length} pending migration(s)\n`)
  
  for (const migration of pending) {
    await runMigration(client, migration)
  }
  
  console.log(`\n✓ Successfully applied ${pending.length} migration(s)`)
}

// Main function
async function main() {
  const pool = new Pool(config)
  let client
  
  try {
    console.log('=== Database Migration Tool ===')
    console.log(`Database: ${config.host}:${config.port}/${config.database}`)
    console.log(`User: ${config.user}`)
    console.log('')
    
    client = await pool.connect()
    
    // Create migrations tracking table
    await createMigrationsTable(client)
    
    // Execute command
    switch (command) {
      case 'up':
        await runPendingMigrations(client)
        break
      case 'status':
        await showStatus(client)
        break
      default:
        console.error(`Unknown command: ${command}`)
        console.error('Available commands: up, status')
        process.exit(1)
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:')
    console.error(error.message)
    if (error.stack) {
      console.error('\nStack trace:')
      console.error(error.stack)
    }
    process.exit(1)
  } finally {
    if (client) client.release()
    await pool.end()
  }
}

main()

