# Database Migration System

This project uses Knex.js for database migrations and schema management.

## Prerequisites

- PostgreSQL 14+ with TimescaleDB extension installed
- Node.js 18+
- Environment variables configured (see `.env.example`)

## Setup

1. **Install PostgreSQL and TimescaleDB**

   ```bash
   # macOS (using Homebrew)
   brew install postgresql@14
   brew install timescaledb

   # Follow TimescaleDB setup instructions
   timescaledb-tune --quiet --yes
   ```

2. **Create Database**

   ```bash
   createdb horse_racing
   ```

3. **Configure Environment**

   Copy `.env.example` to `.env` and update database credentials:

   ```bash
   cp .env.example .env
   ```

## Migration Commands

### Run All Pending Migrations

```bash
npm run migrate:latest
```

This will execute all migrations that haven't been run yet, creating all tables and hypertables.

### Rollback Last Migration Batch

```bash
npm run migrate:rollback
```

Rolls back the last batch of migrations. Use with caution in production.

### Check Migration Status

```bash
npm run migrate:status
```

Shows which migrations have been run and which are pending.

### Create New Migration

```bash
npm run migrate:make migration_name
```

Creates a new migration file in `src/db/migrations/` with timestamp prefix.

## Migration Files

Migrations are located in `src/db/migrations/` and are executed in order:

1. **20240101000001_enable_extensions.ts** - Enables UUID and TimescaleDB extensions
2. **20240101000002_create_users_tables.ts** - Users, preferences, and watchlist tables
3. **20240101000003_create_bookmakers_tables.ts** - Bookmakers, features, and promotions
4. **20240101000004_create_races_tables.ts** - Races, horses, and race entries
5. **20240101000005_create_odds_snapshots_hypertable.ts** - Odds snapshots (TimescaleDB hypertable)
6. **20240101000006_create_ambassadors_tables.ts** - Ambassadors, articles, and tags
7. **20240101000007_create_referrals_table.ts** - Affiliate tracking
8. **20240101000008_create_news_tables.ts** - News articles and entities
9. **20240101000009_create_scraper_tables.ts** - Scraper sources and metrics (hypertable)

## TimescaleDB Hypertables

Two tables are configured as TimescaleDB hypertables for time-series data:

### odds_snapshots

- Partitioned by `timestamp` column
- Retention policy: 90 days
- Optimized for time-based queries on odds data

### scraper_metrics

- Partitioned by `timestamp` column
- Retention policy: 30 days
- Tracks scraper performance over time

## Seeds

### Create Seed File

```bash
npm run seed:make seed_name
```

### Run Seeds

```bash
npm run seed:run
```

Seeds are useful for populating initial data like bookmakers, scraper sources, etc.

## Database Schema

### Core Tables

- **users** - User accounts and authentication
- **user_preferences** - User notification and email preferences
- **watchlist_items** - User watchlist for horses, jockeys, trainers
- **bookmakers** - Bookmaker information and API configuration
- **bookmaker_features** - Bookmaker features (cash out, streaming, etc.)
- **promotions** - Bookmaker promotions and offers
- **races** - Race information and metadata
- **horses** - Horse details and form
- **race_entries** - Horses participating in races
- **odds_snapshots** - Time-series odds data (hypertable)
- **ambassadors** - Racing industry personalities
- **ambassador_social_links** - Ambassador social media links
- **articles** - Ambassador articles and tips
- **article_tags** - Article categorization
- **article_related_races** - Links articles to races
- **referrals** - Affiliate click and conversion tracking
- **news_articles** - Aggregated racing news
- **news_article_entities** - Entities mentioned in news
- **scraper_sources** - Data source configuration
- **scraper_metrics** - Scraper performance metrics (hypertable)

## Connection Pooling

The application uses connection pooling configured in `src/config/database.ts`:

- **Development**: 2-10 connections
- **Production**: 2-20 connections
- **Idle timeout**: 30 seconds
- **Connection timeout**: 2 seconds

## Best Practices

1. **Always test migrations locally first**

   ```bash
   npm run migrate:latest
   npm run migrate:rollback
   npm run migrate:latest
   ```

2. **Never modify existing migrations** - Create new migrations for schema changes

3. **Use transactions** - Knex automatically wraps migrations in transactions

4. **Write reversible migrations** - Always implement both `up()` and `down()` functions

5. **Test with production-like data** - Use seeds to create realistic test data

## Troubleshooting

### TimescaleDB Extension Not Found

```bash
# Ensure TimescaleDB is installed and configured
psql -d horse_racing -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"
```

### Migration Fails Midway

Check the `knex_migrations` table to see which migrations completed:

```sql
SELECT * FROM knex_migrations ORDER BY id DESC;
```

If needed, manually rollback and fix the migration file.

### Connection Issues

Verify database credentials and connection:

```bash
psql -h localhost -U postgres -d horse_racing -c "SELECT NOW();"
```

## Production Deployment

1. **Backup database** before running migrations
2. **Run migrations** during maintenance window
3. **Verify** migration status and application health
4. **Monitor** for errors in logs

```bash
# Production migration
NODE_ENV=production npm run migrate:latest
```

## Additional Resources

- [Knex.js Documentation](https://knexjs.org/)
- [TimescaleDB Documentation](https://docs.timescale.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
