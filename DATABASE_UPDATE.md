# Database Schema Update

## Issue

The database schema was updated to change the `card_last_four` column to `card_number` in the `payment_methods` table. If you're seeing errors like:

```
ERROR: column "card_number" of relation "payment_methods" does not exist
```

This means your database still has the old schema and needs to be updated.

## Quick Solution (Development - No Data Preservation)

Run the reset script:

```bash
./scripts/reset-db.sh
```

Or manually:

```bash
docker compose -f docker-compose.dev.yml down
docker volume rm atlas-gym_postgres_data_dev
docker compose -f docker-compose.dev.yml up
```

## If Reset Doesn't Work

Sometimes Docker volumes can be stubborn. Try these additional steps:

### 1. List and remove all volumes
```bash
docker compose -f docker-compose.dev.yml down -v
docker volume ls | grep atlas-gym
docker volume rm $(docker volume ls -q | grep atlas-gym)
```

### 2. Prune unused volumes
```bash
docker volume prune -f
```

### 3. Restart Docker
If volumes still persist, restart Docker completely:
- On Docker Desktop: Quit and restart the application
- On Linux: `sudo systemctl restart docker`

### 4. Verify the database is fresh
After starting containers, check that the new schema is in place:

```bash
docker exec -it atlas-gym-postgres-dev psql -U your_username -d your_database -c "\d gym_manager.payment_methods"
```

You should see `card_number` column, not `card_last_four`.

## Migration for Production

If you need to preserve existing data, use the migration script:

```bash
docker cp db/migrations/001_rename_card_last_four_to_card_number.sql atlas-gym-postgres-dev:/tmp/
docker exec -it atlas-gym-postgres-dev psql -U your_username -d your_database -f /tmp/001_rename_card_last_four_to_card_number.sql
```

See `db/migrations/README.md` for more details.
