# Atlas Gym Management System

A modern gym management system built with Next.js and PostgreSQL.

## Features

- User management and authentication
- Session tracking
- Payment method management
- Database migrations system

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (package manager)
- Docker and Docker Compose (for containerized setup)
- PostgreSQL 18+ (if running locally without Docker)

### Quick Start with Docker

1. Clone the repository:
```bash
git clone https://github.com/atlas-cluster/atlas-gym.git
cd atlas-gym
```

2. Create a `.env` file from the example:
```bash
cp .env.example .env
```

3. Start the development environment:
```bash
npm run docker:dev
```

This will:
- Start PostgreSQL database
- Run database migrations automatically
- Start the Next.js development server on http://localhost:3000

### Local Development (without Docker)

1. Install dependencies:
```bash
bun install
```

2. Set up your environment variables in `.env`:
```bash
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=atlas_gym_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

3. Make sure PostgreSQL is running, then run migrations:
```bash
npm run migrate
```

4. Start the development server:
```bash
bun run dev
```

## Database Migrations

This project uses a simple SQL-based migration system. See [MIGRATIONS.md](./MIGRATIONS.md) for detailed documentation.

### Common Migration Commands

```bash
# Run all pending migrations
npm run migrate

# Check migration status
npm run migrate:status

# Create a new migration
npm run migrate:create my_feature_name
```

## Project Structure

```
atlas-gym/
├── app/                    # Next.js app directory
├── components/             # React components
├── db/
│   ├── migrations/         # Database migration files
│   └── init/               # Legacy SQL files (reference)
├── lib/                    # Utility functions and shared code
├── scripts/                # Helper scripts
│   ├── migrate.js          # Migration runner
│   └── create-migration.js # Migration creator
├── public/                 # Static assets
└── MIGRATIONS.md           # Migration documentation
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier
- `npm run docker:dev` - Start Docker development environment
- `npm run docker:prod` - Start Docker production environment
- `npm run migrate` - Run database migrations
- `npm run migrate:status` - Check migration status
- `npm run migrate:create` - Create new migration

## Default Credentials

When using the seeded database, you can log in with:
- Email: `admin@admin.com`
- Password: `admin`

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL 18
- **Package Manager**: Bun
- **Container**: Docker

## License

See [LICENSE](./LICENSE) file for details.
