# Database Migrations Guide

This project uses a simple SQL-based migration system. Migrations are numbered sequentially (001, 002, 003, etc.) and run in order.

## Overview

The migration system provides:
- Simple SQL migration files with integer versioning
- Automatic tracking of which migrations have been applied
- Support for both development and production environments
- Automatic migration running in Docker environments

## Directory Structure

```
atlas-gym/
├── db/
│   ├── migrations/           # Migration files (numbered)
│   │   ├── 001_initial_schema.sql
│   │   └── 002_seed_data.sql
│   └── init/                 # Legacy SQL files (kept for reference)
├── scripts/
│   ├── migrate.js            # Migration runner script
│   └── docker-migrate.sh     # Docker migration entrypoint
```

## Migration Naming Convention

Migration files must follow this naming pattern:
```
NNN_description.sql
```

Where:
- `NNN` is a 3-digit number (001, 002, 003, etc.)
- `description` is a brief description using underscores for spaces
- File extension is `.sql`

Examples:
- `001_initial_schema.sql`
- `002_seed_data.sql`
- `003_add_trainers_table.sql`

## Environment Variables

The migration system needs database connection information:

```bash
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=db
POSTGRES_HOST=localhost    # Optional, defaults to localhost
POSTGRES_PORT=5432         # Optional, defaults to 5432
```

## Usage

### Running Migrations

Apply all pending migrations:
```bash
npm run migrate
# or
node scripts/migrate.js up
```

### Check Migration Status

See which migrations have been applied:
```bash
npm run migrate:status
# or
node scripts/migrate.js status
```

### Creating a New Migration

1. Find the highest numbered migration file in `db/migrations/`
2. Create a new file with the next number
3. Add your SQL code

Example:
```bash
# If the last migration is 002_seed_data.sql
# Create: db/migrations/003_add_feature.sql
```

Migration file template:
```sql
-- Migration: 003
-- Description: Add new feature

SET search_path TO gym_manager;

-- Your SQL statements here
CREATE TABLE IF NOT EXISTS my_new_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL
);
```

### Docker Usage

Migrations run automatically when you start the Docker containers:

#### Development:
```bash
npm run docker:dev
```

#### Production:
```bash
npm run docker:prod
```

The migrations run before the application starts, ensuring the database is always up to date.

## How It Works

1. The migration system maintains a `schema_migrations` table that tracks which migrations have been applied
2. When you run migrations, the system:
   - Checks which migration files exist in `db/migrations/`
   - Compares them to the `schema_migrations` table
   - Runs any pending migrations in order
   - Records each successful migration

3. Each migration runs in a transaction:
   - If the migration succeeds, it's recorded in `schema_migrations`
   - If it fails, the transaction is rolled back

## Migration Best Practices

### 1. Always Use Idempotent Statements

Use `IF NOT EXISTS` and `IF EXISTS` to make migrations safe to run multiple times:

```sql
CREATE TABLE IF NOT EXISTS users (...);
DROP TABLE IF EXISTS old_table;
```

### 2. Set the Schema Path

Always include at the top of your migration:
```sql
SET search_path TO gym_manager;
```

### 3. Never Modify Existing Migrations

Once a migration has been applied in any environment, never modify it. Instead:
- Create a new migration to make changes
- Keep a linear history of database changes

### 4. Keep Migrations Small and Focused

Each migration should do one thing:
- ✓ Good: `003_add_users_email_index.sql`
- ✗ Bad: `003_add_indexes_and_update_data_and_add_tables.sql`

### 5. Use Descriptive Names

The migration name should clearly indicate what it does:
- ✓ Good: `004_add_trainers_table.sql`
- ✗ Bad: `004_update.sql`

### 6. Test Locally First

Always test new migrations locally before deploying:
```bash
npm run migrate:status  # Check status
npm run migrate         # Run migrations
```

## Common Migration Tasks

### Adding a Table
```sql
-- Migration: 003
-- Description: Add trainers table

SET search_path TO gym_manager;

CREATE TABLE IF NOT EXISTS trainers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialty VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Adding a Column
```sql
-- Migration: 004
-- Description: Add phone_verified to users

SET search_path TO gym_manager;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
```

### Creating an Index
```sql
-- Migration: 005
-- Description: Add index on users email

SET search_path TO gym_manager;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(user_email);
```

### Inserting Data
```sql
-- Migration: 006
-- Description: Add membership types

SET search_path TO gym_manager;

INSERT INTO membership_types (name, price_monthly, description)
VALUES 
    ('Basic', 29.99, 'Access to gym facilities'),
    ('Premium', 59.99, 'Access to gym and classes'),
    ('VIP', 99.99, 'Full access with personal trainer')
ON CONFLICT DO NOTHING;
```

## Troubleshooting

### Migration Failed

If a migration fails:
1. Check the error message in the console
2. The failed migration will NOT be recorded in `schema_migrations`
3. Fix the SQL in the migration file
4. Run migrations again

### Check What's Been Applied

Query the migrations table directly:
```sql
SELECT * FROM schema_migrations ORDER BY version;
```

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

### Skip a Migration (Not Recommended)

If you absolutely need to mark a migration as applied without running it:
```sql
INSERT INTO schema_migrations (version, name) 
VALUES (3, 'description_of_migration');
```

## Migration History

- `001_initial_schema.sql` - Initial database schema with users, sessions, and payment_methods tables
- `002_seed_data.sql` - Seed data with demo user (admin@admin.com / admin)

## Database Schema

The database uses a dedicated schema called `gym_manager` to organize tables and avoid naming conflicts with PostgreSQL system tables.

