# Database Migrations Guide

This project uses [node-pg-migrate](https://github.com/salsita/node-pg-migrate) for database migrations. This guide explains how to use the migration system.

## Overview

The migration system provides:
- Version-controlled database schema changes
- Repeatable and reliable database setup
- Support for both up (apply) and down (rollback) migrations
- TypeScript support for type-safe migrations
- Automatic migration running in Docker environments

## Directory Structure

```
atlas-gym/
├── migrations/           # Migration files (timestamped)
│   ├── 1734519000000_initial-schema.ts
│   └── 1734519100000_seed-initial-data.ts
├── scripts/
│   ├── migrate.js       # Migration runner script
│   └── docker-migrate.sh # Docker migration entrypoint
├── .pgmigrate.json      # Migration configuration
└── db/
    └── init/            # Legacy SQL files (kept for reference)
```

## Configuration

The migration system is configured via `.pgmigrate.json`:

```json
{
  "databaseUrl": {
    "env": "DATABASE_URL"
  },
  "migrationsTable": "pgmigrations",
  "dir": "migrations",
  "schema": "gym_manager",
  "direction": "up",
  "count": 999,
  "createSchema": true,
  "createMigrationsSchema": false,
  "checkOrder": true
}
```

## Environment Variables

The migration system needs database connection information. You can provide this in two ways:

### Option 1: Individual variables (recommended for Docker)
```bash
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

### Option 2: Database URL
```bash
DATABASE_URL=postgres://user:password@localhost:5432/db
```

## Usage

### Creating a New Migration

To create a new migration file:

```bash
npm run migrate:create my-migration-name
```

This creates a new timestamped TypeScript file in the `migrations/` directory.

Example migration file structure:

```typescript
import { MigrationBuilder } from 'node-pg-migrate'

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Your schema changes here
  pgm.createTable('my_table', {
    id: { type: 'uuid', primaryKey: true },
    name: { type: 'varchar(100)', notNull: true }
  })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // Rollback changes here
  pgm.dropTable('my_table')
}
```

### Running Migrations

#### Apply all pending migrations:
```bash
npm run migrate:up
# or
node scripts/migrate.js up
```

#### Rollback the last migration:
```bash
npm run migrate:down
# or
node scripts/migrate.js down
```

#### Check migration status:
```bash
npm run migrate
# or
node scripts/migrate.js
```

### Docker Usage

Migrations run automatically when you start the Docker containers:

#### Development:
```bash
npm run docker:dev
# or
docker compose -f docker-compose.dev.yml up
```

#### Production:
```bash
npm run docker:prod
# or
docker compose -f docker-compose.prod.yml up --build
```

The migrations run before the application starts, ensuring the database is always up to date.

## Migration Best Practices

### 1. Always Test Both Up and Down
- Test your `up` migration to ensure it applies cleanly
- Test your `down` migration to ensure it rolls back properly
- Never deploy a migration without testing both directions

### 2. Make Migrations Idempotent When Possible
Use conditional statements to make migrations safe to run multiple times:

```typescript
pgm.createTable('users', { /* ... */ }, { ifNotExists: true })
```

### 3. Never Modify Existing Migrations
Once a migration has been applied in production, never modify it. Instead, create a new migration to make additional changes.

### 4. Keep Migrations Small and Focused
Each migration should do one thing. This makes it easier to:
- Understand what changed
- Roll back specific changes
- Debug issues

### 5. Use Transactions
Migrations run in transactions by default. If any part fails, the entire migration is rolled back.

### 6. Add Data Migrations Separately
Keep schema migrations separate from data migrations:
- Schema: Tables, columns, indexes, constraints
- Data: Seed data, data transformations, updates

## Common Migration Tasks

### Adding a Column
```typescript
export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumn('users', {
    phone_verified: { type: 'boolean', default: false }
  })
}
```

### Creating an Index
```typescript
export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createIndex('users', 'email')
}
```

### Adding a Foreign Key
```typescript
export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addConstraint('orders', 'fk_user', {
    foreignKeys: {
      columns: 'user_id',
      references: 'users(id)',
      onDelete: 'CASCADE'
    }
  })
}
```

### Renaming a Table
```typescript
export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.renameTable('old_name', 'new_name')
}
```

## Troubleshooting

### Migration Failed
If a migration fails:
1. Check the error message for details
2. Fix the issue in the migration file
3. If the migration partially applied, you may need to manually clean up
4. Re-run the migration

### Reset Database (Development Only)
To start fresh in development:

```bash
# Stop containers
docker compose -f docker-compose.dev.yml down

# Remove the volume (this deletes all data!)
docker volume rm atlas-gym_postgres_data_dev

# Start fresh
docker compose -f docker-compose.dev.yml up
```

### Check Which Migrations Have Run
The `pgmigrations` table in your database tracks which migrations have been applied:

```sql
SELECT * FROM gym_manager.pgmigrations ORDER BY run_on DESC;
```

## Migration History

- `1734519000000_initial-schema.ts` - Initial database schema with users, sessions, and payment_methods tables
- `1734519100000_seed-initial-data.ts` - Seed data with demo user and payment method

## Additional Resources

- [node-pg-migrate Documentation](https://github.com/salsita/node-pg-migrate)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
