# Backend Setup Guide

This guide will help you set up the backend infrastructure for the horse racing platform.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js 18+** and npm
- **PostgreSQL 14+**
- **TimescaleDB extension** for PostgreSQL
- **Redis 6+**

## Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up PostgreSQL with TimescaleDB

#### macOS (using Homebrew)

```bash
# Install PostgreSQL
brew install postgresql@14

# Install TimescaleDB
brew tap timescale/tap
brew install timescaledb

# Initialize TimescaleDB
timescaledb-tune --quiet --yes

# Start PostgreSQL
brew services start postgresql@14
```

#### Linux (Ubuntu/Debian)

```bash
# Add PostgreSQL repository
sudo sh -c "echo 'deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main' > /etc/apt/sources.list.d/pgdg.list"
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Add TimescaleDB repository
sudo sh -c "echo 'deb https://packagecloud.io/timescale/timescaledb/ubuntu/ $(lsb_release -c -s) main' > /etc/apt/sources.list.d/timescaledb.list"
wget --quiet -O - https://packagecloud.io/timescale/timescaledb/gpgkey | sudo apt-key add -

# Install packages
sudo apt-get update
sudo apt-get install postgresql-14 timescaledb-2-postgresql-14

# Configure TimescaleDB
sudo timescaledb-tune --quiet --yes

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 3. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE horse_racing;

# Connect to the database
\c horse_racing

# Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

# Exit psql
\q
```

### 4. Set Up Redis

#### macOS (using Homebrew)

```bash
brew install redis
brew services start redis
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

#### Verify Redis is running

```bash
redis-cli ping
# Should return: PONG
```

### 5. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your database credentials
# Update DB_PASSWORD if you set a password for PostgreSQL
```

Example `.env` file:

```env
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=horse_racing
DB_USER=postgres
DB_PASSWORD=postgres
DB_POOL_MAX=20
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### 6. Run Database Migrations

```bash
# Run all migrations to create tables
npm run migrate:latest

# Check migration status
npm run migrate:status
```

You should see output indicating all migrations have been run successfully.

### 7. Start the Development Server

```bash
npm run dev
```

The server should start on port 3001 (or the port specified in your `.env` file).

### 8. Verify Setup

Open your browser or use curl to test the health endpoint:

```bash
curl http://localhost:3001/health
```

You should see a response like:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

## Troubleshooting

### PostgreSQL Connection Issues

If you can't connect to PostgreSQL:

1. Check if PostgreSQL is running:

   ```bash
   # macOS
   brew services list | grep postgresql

   # Linux
   sudo systemctl status postgresql
   ```

2. Verify connection settings:

   ```bash
   psql -h localhost -U postgres -d horse_racing
   ```

3. Check PostgreSQL logs for errors

### TimescaleDB Extension Not Found

If migrations fail with "extension timescaledb does not exist":

```bash
# Connect to database
psql -U postgres -d horse_racing

# Enable extension manually
CREATE EXTENSION IF NOT EXISTS timescaledb;
```

### Redis Connection Issues

If Redis connection fails:

1. Check if Redis is running:

   ```bash
   redis-cli ping
   ```

2. Check Redis logs:

   ```bash
   # macOS
   tail -f /usr/local/var/log/redis.log

   # Linux
   sudo journalctl -u redis-server -f
   ```

### Migration Errors

If migrations fail:

1. Check migration status:

   ```bash
   npm run migrate:status
   ```

2. Rollback last migration:

   ```bash
   npm run migrate:rollback
   ```

3. Fix the issue and run migrations again:
   ```bash
   npm run migrate:latest
   ```

## Next Steps

After successful setup:

1. Review the database schema in `src/db/schema.sql`
2. Check migration files in `src/db/migrations/`
3. Read the migration documentation in `src/db/README.md`
4. Start implementing the next tasks in the implementation plan

## Useful Commands

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Build TypeScript to JavaScript
npm run start            # Start production server

# Database Migrations
npm run migrate:latest   # Run all pending migrations
npm run migrate:rollback # Rollback last migration batch
npm run migrate:status   # Check migration status
npm run migrate:make     # Create new migration

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # Check TypeScript types
```

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TimescaleDB Documentation](https://docs.timescale.com/)
- [Redis Documentation](https://redis.io/documentation)
- [Knex.js Documentation](https://knexjs.org/)
- [Express.js Documentation](https://expressjs.com/)
