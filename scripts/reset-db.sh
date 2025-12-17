#!/bin/bash

# Script to reset the development database with the new schema
# This is useful when database schema changes and you need to start fresh

echo "🔄 Resetting development database..."
echo ""

# Stop containers
echo "📦 Stopping containers..."
docker compose -f docker-compose.dev.yml down

# Remove the volume
echo "🗑️  Removing database volume..."
docker volume rm atlas-gym_postgres_data_dev 2>/dev/null || echo "Volume already removed or doesn't exist"

# Start containers (this will recreate the database with new schema)
echo "🚀 Starting containers with fresh database..."
docker compose -f docker-compose.dev.yml up -d

echo ""
echo "✅ Database reset complete!"
echo ""
echo "The database has been recreated with the latest schema."
echo "You can now access the application at http://localhost:3000"
echo ""
echo "To view logs, run: docker compose -f docker-compose.dev.yml logs -f"
