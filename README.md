# Atlas Gym - Gym Management System

A modern gym management system built with Next.js 16, React 19, PostgreSQL 18, and Bun.

## Quick Start

### Development with Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/atlas-cluster/atlas-gym.git
   cd atlas-gym
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env if you want to change default values
   ```

3. **Start the development environment:**
   ```bash
   docker compose -f docker-compose.dev.yml up
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - PostgreSQL: localhost:5432

### Development without Docker

1. **Install Bun:**
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Set up PostgreSQL 18** (you'll need to install it separately)

4. **Configure environment:**
   ```bash
   cp .env.example .env
   # Update .env with your PostgreSQL credentials
   ```

5. **Run the development server:**
   ```bash
   bun run dev
   ```

## Features

- 🏋️ Gym management dashboard
- 💾 PostgreSQL 18 database with comprehensive schema
- 🎨 Modern UI with Tailwind CSS v4 and Radix UI
- 🔌 Database connection testing UI
- 🐳 Docker support for dev and prod environments
- 🚀 Automated deployment via GitHub Actions

## Database Testing

The application includes a built-in database connection tester:
1. Navigate to the home page
2. Click "Test Connection" button
3. View connection status and PostgreSQL version

This uses the native `pg` adapter for direct PostgreSQL connectivity.

## Tech Stack

- **Frontend:** Next.js 16, React 19
- **Runtime:** Bun
- **Database:** PostgreSQL 18
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI
- **Containerization:** Docker & Docker Compose

## Documentation

- [Docker Setup Guide](./DOCKER_SETUP.md) - Comprehensive guide for Docker development and production
- [Database Schema](./db/init/01_schema.sql) - Complete database structure

## Project Structure

```
atlas-gym/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── db-ping/       # Database health check endpoint
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── database-status.tsx # DB connection tester
├── db/                    # Database files
│   └── init/             # SQL initialization scripts
├── lib/                   # Utility libraries
│   └── db.ts             # Database connection pool
├── docker-compose.dev.yml # Development Docker setup
├── docker-compose.prod.yml # Production Docker setup
├── Dockerfile.dev         # Development container
├── Dockerfile.prod        # Production container
└── .github/workflows/     # CI/CD pipelines
    └── deploy.yml        # Production deployment
```

## Development

### Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run format` - Format code with Prettier

### Docker Commands

**Development:**
```bash
# Start services
docker compose -f docker-compose.dev.yml up

# Stop services
docker compose -f docker-compose.dev.yml down

# View logs
docker compose -f docker-compose.dev.yml logs -f
```

**Production:**
```bash
# Build and start
docker compose -f docker-compose.prod.yml up -d --build

# Stop services
docker compose -f docker-compose.prod.yml down

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

## Deployment

The repository includes a GitHub Actions workflow for automated deployment to Ubuntu servers.

### Required GitHub Secrets

- `DEPLOY_HOST` - Server IP/hostname
- `DEPLOY_USER` - SSH username
- `DEPLOY_SSH_KEY` - SSH private key
- `DEPLOY_PORT` - SSH port (default: 22)
- `DEPLOY_PATH` - Deployment directory
- `POSTGRES_USER` - Database username
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DB` - Database name

Deployment triggers automatically on push to `main` branch or can be manually triggered.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

See [LICENSE](./LICENSE) file for details.

## Support

For detailed setup instructions, troubleshooting, and advanced configuration, see the [Docker Setup Guide](./DOCKER_SETUP.md).
