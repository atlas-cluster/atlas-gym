# Database Setup Guide

This project uses Prisma with PostgreSQL for database management.

## Prerequisites

- PostgreSQL installed locally or access to a PostgreSQL server
- Bun (or npm/yarn) installed

## Local Development Setup

### 1. Install PostgreSQL

#### macOS (using Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Windows
Download and install from [PostgreSQL Official Website](https://www.postgresql.org/download/windows/)

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE atlas_gym;

# Create user (optional, if not using default postgres user)
CREATE USER atlas_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE atlas_gym TO atlas_user;

# Exit psql
\q
```

### 3. Configure Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Update the `DATABASE_URL` in `.env` with your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/atlas_gym?schema=public"
```

Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA`

### 4. Run Database Migrations

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or create a migration (recommended for production)
npm run db:migrate
```

### 5. Test Database Connection

Start the development server:

```bash
npm run dev
```

Visit http://localhost:3000 and click the "Ping Database" button to test the connection.

## Production Deployment (SSH)

### 1. Set up PostgreSQL on Production Server

```bash
# SSH into your server
ssh user@your-server.com

# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE atlas_gym;
CREATE USER atlas_user WITH PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE atlas_gym TO atlas_user;
\q
```

### 2. Configure Production Environment

On your production server, create a `.env` file:

```env
DATABASE_URL="postgresql://atlas_user:strong_password_here@localhost:5432/atlas_gym?schema=public"
NODE_ENV=production
```

### 3. Deploy and Run Migrations

```bash
# Install dependencies
bun install

# Generate Prisma Client
bun run db:generate

# Run migrations
bun run db:migrate

# Build Next.js app
bun run build

# Start production server
bun run start
```

### 4. Using PM2 for Process Management (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start bun --name "atlas-gym" -- run start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on server reboot
pm2 startup
```

## Database Scripts

Available npm scripts for database management:

- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database (development)
- `npm run db:migrate` - Create and run migrations (production)
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:seed` - Run database seed script

## Prisma Studio

To visually manage your database:

```bash
npm run db:studio
```

This will open Prisma Studio at http://localhost:5555

## Database Schema

The initial schema includes a sample `User` model. Edit `prisma/schema.prisma` to add your own models:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

After making changes to the schema:

1. Run `npm run db:generate` to update the Prisma Client
2. Run `npm run db:migrate` to create a migration and apply it

## Troubleshooting

### Connection Issues

If you get connection errors:

1. Check PostgreSQL is running: `sudo systemctl status postgresql` (Linux) or `brew services list` (macOS)
2. Verify your DATABASE_URL in `.env`
3. Check PostgreSQL logs for errors
4. Ensure your database user has proper permissions

### Port Already in Use

If port 5432 is already in use, you can:
- Stop the existing PostgreSQL service
- Use a different port in your DATABASE_URL
- Configure PostgreSQL to use a different port

### Permission Denied

If you get permission errors:
```bash
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE atlas_gym TO your_user;
GRANT ALL ON SCHEMA public TO your_user;
```

## Security Notes

- Never commit `.env` file to version control
- Use strong passwords in production
- Consider using connection pooling for production (e.g., PgBouncer)
- Enable SSL for production database connections
- Regularly backup your production database

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
