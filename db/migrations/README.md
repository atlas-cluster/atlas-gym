# Database Migrations

This directory contains database migration scripts to update the schema for existing databases.

## Applying Migrations

### Option 1: Recreate the Database (Development Only)
If you're in development and don't need to preserve data:

```bash
# Stop the containers
docker compose -f docker-compose.dev.yml down

# Remove the volume to delete the old database
docker volume rm atlas-gym_postgres_data_dev

# Start fresh - this will run the init scripts with the new schema
docker compose -f docker-compose.dev.yml up
```

### Option 2: Apply Migration Manually
If you need to preserve existing data:

```bash
# Connect to the PostgreSQL container
docker exec -it atlas-gym-postgres-dev psql -U your_username -d your_database

# Then run the migration SQL
\i /docker-entrypoint-initdb.d/migrations/001_rename_card_last_four_to_card_number.sql
```

Or copy the migration file and run it:

```bash
docker cp db/migrations/001_rename_card_last_four_to_card_number.sql atlas-gym-postgres-dev:/tmp/
docker exec -it atlas-gym-postgres-dev psql -U your_username -d your_database -f /tmp/001_rename_card_last_four_to_card_number.sql
```

## Migration List

- `001_rename_card_last_four_to_card_number.sql` - Renames `card_last_four` column to `card_number` and increases size to VARCHAR(19) to store full credit card numbers
