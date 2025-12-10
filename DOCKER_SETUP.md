# Quick Start with Docker

This guide will help you get PostgreSQL running locally using Docker in just a few commands.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Bun or npm installed

## 🚀 Quick Start (Recommended)

Run the complete setup in one command:

```bash
npm run db:setup
```

This command will:
1. Start PostgreSQL in Docker
2. Wait for it to be ready
3. Generate Prisma Client
4. Push the database schema

Then start the development server:

```bash
npm run dev
```

Visit http://localhost:3000 and click "Ping Database" to test the connection! ✅

## 📦 Manual Setup

If you prefer to run commands separately:

### 1. Start PostgreSQL

```bash
npm run db:up
```

This starts PostgreSQL in a Docker container in the background.

### 2. Generate Prisma Client

```bash
npm run db:generate
```

### 3. Push Database Schema

```bash
npm run db:push
```

### 4. Start Development Server

```bash
npm run dev
```

## 🛠️ Available Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:setup` | Complete setup (start DB + generate + migrate) |
| `npm run db:up` | Start PostgreSQL container |
| `npm run db:down` | Stop and remove PostgreSQL container |
| `npm run db:restart` | Restart PostgreSQL container |
| `npm run db:logs` | View PostgreSQL logs |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Create and run migration |
| `npm run db:studio` | Open Prisma Studio GUI |

## 🐳 Docker Configuration

The `docker compose.yml` configures:

- **Image**: PostgreSQL 15 Alpine (lightweight)
- **Database**: `atlas_gym`
- **User**: `postgres`
- **Password**: `postgres`
- **Port**: `5432` (mapped to host)
- **Data Persistence**: Volume `postgres_data`
- **Health Check**: Automatic readiness check

## 🔄 Common Operations

### Stop the Database

```bash
npm run db:down
```

### Restart the Database

```bash
npm run db:restart
```

### View Database Logs

```bash
npm run db:logs
```

Press `Ctrl+C` to exit log view.

### Reset Database (Clean Start)

```bash
# Stop and remove container + volume
docker compose down -v

# Start fresh
npm run db:setup
```

## 🔍 Verify Setup

Check if PostgreSQL is running:

```bash
docker ps
```

You should see a container named `atlas-gym-postgres` running.

## 📊 Access Database

### Using Prisma Studio

```bash
npm run db:studio
```

Opens a GUI at http://localhost:5555

### Using psql (CLI)

```bash
docker exec -it atlas-gym-postgres psql -U postgres -d atlas_gym
```

Useful psql commands:
- `\dt` - List tables
- `\d table_name` - Describe table
- `\q` - Quit

### Using a GUI Client

Connect with your favorite PostgreSQL client:
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `atlas_gym`
- **User**: `postgres`
- **Password**: `postgres`

Popular clients: DBeaver, pgAdmin, TablePlus, Postico

## 🚨 Troubleshooting

### Port Already in Use

If port 5432 is already in use:

```bash
# Check what's using the port
lsof -i :5432

# Stop the PostgreSQL service
sudo service postgresql stop  # Linux
brew services stop postgresql  # macOS
```

Or change the port in `docker compose.yml`:
```yaml
ports:
  - '5433:5432'  # Use host port 5433 instead
```

And update `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/atlas_gym?schema=public"
```

### Container Won't Start

```bash
# Check Docker is running
docker ps

# View error logs
docker compose logs postgres

# Remove and recreate
docker compose down -v
docker compose up -d
```

### Connection Refused

Make sure PostgreSQL is healthy:

```bash
# Check container status
docker ps

# Check health status
docker inspect atlas-gym-postgres | grep -A 5 Health

# Wait a few seconds and try again
```

### Database Already Exists Error

```bash
# Reset the database
docker compose down -v
npm run db:setup
```

## 🌍 Environment Variables

The Docker setup works with the default `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/atlas_gym?schema=public"
```

To use different credentials, update both:
1. `docker compose.yml` environment variables
2. `.env` DATABASE_URL

## 🔒 Security Notes

**For Development:**
- Default credentials are fine for local development
- Data persists in a Docker volume

**For Production:**
- DO NOT use these credentials
- Use strong passwords
- Enable SSL connections
- Set up proper backups
- See `DATABASE_SETUP.md` for production deployment

## 🎯 Next Steps

1. Start the database: `npm run db:setup`
2. Start the dev server: `npm run dev`
3. Test the connection at http://localhost:3000
4. Start building your models in `prisma/schema.prisma`
5. Run migrations: `npm run db:migrate`

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Prisma Documentation](https://www.prisma.io/docs)
- See `DATABASE_SETUP.md` for production deployment

---

**Need help?** Check the troubleshooting section above or refer to `DATABASE_SETUP.md` for more detailed information.
