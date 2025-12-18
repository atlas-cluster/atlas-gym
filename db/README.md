# Database Migrations

This project uses Flyway for database migrations, providing a versioned and reproducible approach to database schema management.

## Overview

The database migrations are managed by Flyway, which runs as a Docker container during the application startup. Flyway automatically applies pending migrations when the stack is brought up.

## Directory Structure

```
db/
├── flyway.conf           # Flyway configuration file
├── migrations/           # Versioned migration files
│   ├── V1__initial_schema.sql
│   ├── V2__seed_data.sql
│   └── ...
└── init/                 # Legacy init scripts (kept for reference)
```

## Migration File Naming Convention

Flyway migrations follow a strict naming convention:

```
V{version}__{description}.sql
```

- **V**: Prefix indicating versioned migration
- **{version}**: Numeric version (e.g., 1, 2, 3, or 1.1, 1.2)
- **__**: Double underscore separator
- **{description}**: Brief description using underscores for spaces

Examples:
- `V1__initial_schema.sql`
- `V2__seed_data.sql`
- `V3__add_trainer_tables.sql`
- `V3.1__add_trainer_indexes.sql`

## How It Works

1. **Postgres starts** and becomes healthy
2. **Flyway container runs** automatically after Postgres is ready
3. **Migrations are applied** in version order
4. **Flyway exits** after completing migrations
5. **Application starts** with the migrated database

The dependency chain in docker-compose ensures migrations complete before the app starts.

## Running Migrations

### Development Environment

Start the full stack (migrations run automatically):
```bash
npm run docker:dev
# or
docker compose -f docker-compose.dev.yml up
```

Run only migrations:
```bash
docker compose -f docker-compose.dev.yml up flyway
```

### Production Environment

```bash
npm run docker:prod
# or
docker compose -f docker-compose.prod.yml up
```

## Creating New Migrations

1. Create a new SQL file in `db/migrations/` following the naming convention
2. Add your SQL statements (CREATE TABLE, ALTER TABLE, INSERT, etc.)
3. Restart the stack - Flyway will automatically detect and apply the new migration

Example new migration (`V3__add_trainer_tables.sql`):
```sql
-- Add trainer license table
CREATE TABLE gym_manager.trainer_license (
    id SERIAL PRIMARY KEY,
    license_name VARCHAR(50) NOT NULL,
    license_description VARCHAR(200)
);

-- Add trainer table
CREATE TABLE gym_manager.trainer (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES gym_manager.users(id),
    license_id INT NOT NULL REFERENCES gym_manager.trainer_license(id),
    start_date DATE NOT NULL,
    end_date DATE
);
```

## Migration History

Flyway tracks applied migrations in the `flyway_schema_history` table within your schema. You can view the migration history:

```bash
docker exec atlas-gym-postgres-dev psql -U user -d db -c "SELECT * FROM gym_manager.flyway_schema_history;"
```

## Configuration

Flyway configuration is in `db/flyway.conf`:

- **Database URL**: Connects to the postgres service
- **Schema**: `gym_manager` (migrations are applied to this schema)
- **Baseline on Migrate**: Allows migrations on existing databases
- **Validate on Migrate**: Validates checksums of applied migrations

## Troubleshooting

### Viewing Flyway Logs

```bash
docker logs atlas-gym-flyway-dev
```

### Failed Migration

If a migration fails:
1. Check the Flyway logs for the error message
2. Fix the SQL in the migration file
3. Drop the database volume and restart:
   ```bash
   docker compose -f docker-compose.dev.yml down -v
   docker compose -f docker-compose.dev.yml up
   ```

### Resetting the Database

To start fresh (WARNING: This deletes all data):

```bash
# Development
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up

# Production
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up
```

## Best Practices

1. **Never modify applied migrations** - Create a new migration instead
2. **Test migrations locally** before deploying
3. **Keep migrations small** and focused on one change
4. **Use descriptive names** that explain what the migration does
5. **Include rollback instructions** in comments if the migration is complex
6. **Version appropriately** - Use major versions (V1, V2) for schema changes and minor versions (V1.1, V1.2) for small fixes

## Comparison to Old System

### Before (docker-entrypoint-initdb.d)
- ❌ Only runs once when database is first created
- ❌ No versioning or migration history
- ❌ Difficult to track what changed and when
- ❌ Can't apply incremental changes to existing databases

### After (Flyway)
- ✅ Runs every time, applies only pending migrations
- ✅ Full version history and audit trail
- ✅ Clear migration order and dependencies
- ✅ Can apply changes to existing databases
- ✅ Validates migration integrity with checksums

## Additional Resources

- [Flyway Documentation](https://documentation.red-gate.com/flyway)
- [Flyway SQL Migrations](https://documentation.red-gate.com/flyway/flyway-cli-and-api/concepts/migrations)
- [Flyway Docker Usage](https://documentation.red-gate.com/flyway/flyway-cli-and-api/usage/flyway-docker)
