# Atlas Gym

A modern gym management system built with Next.js, Prisma, and PostgreSQL.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
bun install
```

### 2. Setup Database

**With Docker (Recommended):**

```bash
npm run db:setup
```

This automatically starts PostgreSQL in Docker, generates Prisma Client, and sets up the database.

**Manual Setup:**

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for manual PostgreSQL installation.

### 3. Start Development Server

```bash
npm run dev
# or
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) and click "Ping Database" to test the connection!

## 📚 Documentation

- **[DOCKER_SETUP.md](./DOCKER_SETUP.md)** - Quick Docker-based PostgreSQL setup (recommended)
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Detailed database setup and production deployment
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical implementation details

## 🛠️ Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Database Management
- `npm run db:setup` - Complete database setup (Docker)
- `npm run db:up` - Start PostgreSQL container
- `npm run db:down` - Stop PostgreSQL container
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Create and run migration
- `npm run db:studio` - Open Prisma Studio GUI

### Code Quality
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🏗️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL 15
- **ORM:** Prisma 7
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI
- **Icons:** Lucide React
- **Runtime:** Bun (compatible)
- **Container:** Docker (for database)

## 📁 Project Structure

```
atlas-gym/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   │   └── db/        # Database API endpoints
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Home page
├── components/         # React components
│   ├── ui/            # UI components
│   └── database-test.tsx  # Database connection test
├── prisma/            # Prisma configuration
│   └── schema.prisma  # Database schema
├── lib/               # Utility functions
│   └── db.ts          # Prisma client
├── docker-compose.yml # Docker configuration
└── .env.example       # Environment variables template
```

## 🔧 Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Default configuration (works with Docker setup):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/atlas_gym?schema=public"
```

## 🐳 Docker Setup

The project includes Docker Compose for easy PostgreSQL setup:

```yaml
services:
  postgres:
    image: postgres:15-alpine
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: atlas_gym
```

Start: `npm run db:up`  
Stop: `npm run db:down`

## 🎯 Features

- ✅ Database connection testing UI
- ✅ Prisma ORM with PostgreSQL
- ✅ Docker-based development environment
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Type-safe database queries
- ✅ Hot module replacement

## 🚀 Deployment

### Production with Docker

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for production deployment instructions via SSH.

### Vercel / Cloud Platforms

1. Set up PostgreSQL database
2. Configure `DATABASE_URL` in environment variables
3. Deploy application
4. Run migrations: `npm run db:migrate`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linter: `npm run lint`
5. Format code: `npm run format`
6. Submit a pull request

## 📝 License

See [LICENSE](./LICENSE) file for details.

## 🆘 Support

- Check [DOCKER_SETUP.md](./DOCKER_SETUP.md) for Docker troubleshooting
- Check [DATABASE_SETUP.md](./DATABASE_SETUP.md) for database issues
- Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for technical details

---

Built with ❤️ using Next.js and Prisma
