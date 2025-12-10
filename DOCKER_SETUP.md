# Atlas Gym - Docker Setup Guide

This guide provides instructions for running Atlas Gym in both development and production environments using Docker and PostgreSQL 18.

## Prerequisites

- Docker and Docker Compose installed
- Bun runtime (for local development without Docker)
- Git

## Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your database credentials:
   ```env
   POSTGRES_USER=atlas_user
   POSTGRES_PASSWORD=your_secure_password
   POSTGRES_DB=atlas_gym
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   ```

## Development Setup

The development setup supports hot reloading for the Next.js frontend.

### Starting Development Environment

```bash
docker compose -f docker-compose.dev.yml up
```

Or run in detached mode:
```bash
docker compose -f docker-compose.dev.yml up -d
```

### Viewing Logs

```bash
docker compose -f docker-compose.dev.yml logs -f app
```

### Stopping Development Environment

```bash
docker compose -f docker-compose.dev.yml down
```

### Development Features

- **Hot Reloading**: Code changes are automatically detected and the app reloads
- **PostgreSQL 18**: Database with persistent volume
- **Port 3000**: Application accessible at http://localhost:3000
- **Port 5432**: PostgreSQL accessible for database clients

### Database Access (Development)

Connect to the PostgreSQL database:
```bash
docker exec -it atlas-gym-postgres-dev psql -U atlas_user -d atlas_gym
```

## Production Setup

The production setup uses optimized builds for deployment.

### Building for Production

```bash
docker compose -f docker-compose.prod.yml build
```

### Starting Production Environment

```bash
docker compose -f docker-compose.prod.yml up -d
```

### Viewing Production Logs

```bash
docker compose -f docker-compose.prod.yml logs -f
```

### Stopping Production Environment

```bash
docker compose -f docker-compose.prod.yml down
```

## GitHub Actions Deployment

The repository includes a GitHub Actions workflow for automated deployment to an Ubuntu server via SSH.

### Required GitHub Secrets

Configure the following secrets in your GitHub repository settings:

- `DEPLOY_HOST`: Your Ubuntu server IP or hostname
- `DEPLOY_USER`: SSH username for the server
- `DEPLOY_SSH_KEY`: Private SSH key for authentication
- `DEPLOY_PORT`: SSH port (default: 22)
- `DEPLOY_PATH`: Deployment directory on the server (e.g., `/var/www/atlas-gym`)
- `POSTGRES_USER`: PostgreSQL username
- `POSTGRES_PASSWORD`: PostgreSQL password
- `POSTGRES_DB`: PostgreSQL database name

### Deployment Process

The workflow automatically deploys when:
- Code is pushed to the `main` branch
- Manually triggered via GitHub Actions UI

The deployment process:
1. Checks out the latest code
2. Creates an `.env` file with secrets
3. Copies files to the server via SCP
4. Connects via SSH and runs deployment commands
5. Stops existing containers
6. Builds new images
7. Starts updated containers

### Manual Deployment

To manually deploy on your Ubuntu server:

1. Clone the repository:
   ```bash
   git clone https://github.com/atlas-cluster/atlas-gym.git
   cd atlas-gym
   ```

2. Create and configure `.env` file:
   ```bash
   cp .env.example .env
   # Edit .env with your production credentials
   ```

3. Deploy:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

## Database Testing

The application includes a database connection test feature accessible from the UI:

1. Navigate to http://localhost:3000
2. Click the "Test Connection" button
3. View connection status and PostgreSQL version

This uses the native `pg` adapter (not Prisma) to test connectivity.

## Useful Commands

### Rebuild Containers

Development:
```bash
docker compose -f docker-compose.dev.yml up --build
```

Production:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Clean Up

Remove all containers and volumes:
```bash
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.prod.yml down -v
```

### Database Backup

```bash
docker exec atlas-gym-postgres-prod pg_dump -U atlas_user atlas_gym > backup.sql
```

### Database Restore

```bash
docker exec -i atlas-gym-postgres-prod psql -U atlas_user atlas_gym < backup.sql
```

## Troubleshooting

### Port Already in Use

If port 3000 or 5432 is already in use, you can modify the port mappings in the docker-compose files.

### Database Connection Issues

1. Ensure the database container is healthy:
   ```bash
   docker compose -f docker-compose.dev.yml ps
   ```

2. Check database logs:
   ```bash
   docker compose -f docker-compose.dev.yml logs postgres
   ```

3. Verify environment variables are correctly set in `.env`

### Hot Reload Not Working

Ensure volume mounts are correctly configured in `docker-compose.dev.yml`. On some systems, you may need to enable file watching:

```bash
# For Linux systems with file watch limits
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Architecture

- **Frontend**: Next.js 16 with React 19
- **Runtime**: Bun
- **Database**: PostgreSQL 18
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI

## License

See LICENSE file for details.
