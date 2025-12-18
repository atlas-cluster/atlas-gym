#!/bin/sh

# Simple Database Migration Script for Docker
# This script waits for PostgreSQL and runs migrations

set -e

echo "=== Database Migration Script ==="
echo "Waiting for PostgreSQL to be ready..."

# Wait for PostgreSQL to be ready
until pg_isready -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is ready!"
echo ""

# Run migrations
echo "Running database migrations..."
node scripts/migrate.js up

echo ""
echo "=== Migrations completed ==="
echo ""
