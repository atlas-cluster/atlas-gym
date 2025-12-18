#!/usr/bin/env node

/**
 * Create a new migration file
 * 
 * Usage:
 *   node scripts/create-migration.js my_feature_name
 */

const fs = require('fs')
const path = require('path')

const migrationsDir = path.join(__dirname, '../db/migrations')
const description = process.argv[2]

if (!description) {
  console.error('Error: Please provide a migration description')
  console.error('Usage: node scripts/create-migration.js description_of_migration')
  process.exit(1)
}

// Clean description (replace spaces with underscores, remove special chars)
const cleanDescription = description
  .toLowerCase()
  .replace(/\s+/g, '_')
  .replace(/[^a-z0-9_]/g, '')

// Get existing migrations to find next number
const files = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort()

let nextNumber = 1
if (files.length > 0) {
  const lastFile = files[files.length - 1]
  const match = lastFile.match(/^(\d+)_/)
  if (match) {
    nextNumber = parseInt(match[1]) + 1
  }
}

const paddedNumber = nextNumber.toString().padStart(3, '0')
const filename = `${paddedNumber}_${cleanDescription}.sql`
const filepath = path.join(migrationsDir, filename)

// Migration template
const template = `-- Migration: ${paddedNumber}
-- Description: ${cleanDescription.replace(/_/g, ' ')}

SET search_path TO gym_manager;

-- Add your SQL statements here

`

// Create the file
fs.writeFileSync(filepath, template)

console.log(`✓ Created migration: ${filename}`)
console.log(`  Location: db/migrations/${filename}`)
console.log('')
console.log('Next steps:')
console.log('1. Edit the migration file and add your SQL statements')
console.log('2. Test the migration: npm run migrate')
console.log('3. Check status: npm run migrate:status')
