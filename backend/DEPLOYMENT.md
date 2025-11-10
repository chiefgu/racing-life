# Backend Deployment Guide - Railway & Render

This guide covers deploying the horse racing platform backend to Railway or Render with PostgreSQL and Redis.

## Table of Contents

1. [Railway Deployment](#railway-deployment)
2. [Render Deployment](#render-deployment)
3. [Database Setup](#database-setup)
4. [Environment Variables](#environment-variables)
5. [Post-Deployment](#post-deployment)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)

---

## Railway Deployment

Railway is recommended for its simplicity and excellent PostgreSQL/Redis support.

### Prerequisites

- Railway account (sign up at https://railway.app)
- Railway CLI installed: `npm install -g @railway/cli`
- GitHub repository (optional, for automatic deployments)

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway

```bash
railway login
```

### Step 3: Create New Project

```bash
cd backend
railway init
```

Follow the prompts to create a new project.

### Step 4: Add PostgreSQL Database

```bash
railway add --database postgresql
```

This creates a PostgreSQL instance with TimescaleDB support.

### Step 5: Add Redis

```bash
railway add --database redis
```

### Step 6: Configure Environment Variables

```bash
# Set environment variables
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set ODDS_API_KEY=your_odds_api_key
railway variables set OPENAI_API_KEY=your_openai_api_key
railway variables set FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
railway variables set SENTRY_DSN=your_sentry_dsn
railway variables set FRONTEND_URL=https://yourdomain.com

# Database and Redis variables are automatically set by Railway
```

### Step 7: Enable TimescaleDB Extension

Connect to your PostgreSQL database:

```bash
railway connect postgresql
```

Then run:

```sql
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
```

### Step 8: Deploy

```bash
railway up
```

Or connect to GitHub for automatic deployments:

```bash
railway link
```

Then push to your repository.

### Step 9: Run Migrations

```bash
railway run npm run migrate:latest
```

### Step 10: Get Deployment URL

```bash
railway domain
```

Or create a custom domain:

```bash
railway domain add api.yourdomain.com
```

---

## Render Deployment

Render provides a simple deployment experience with built-in PostgreSQL and Redis.

### Prerequisites

- Render account (sign up at https://render.com)
- GitHub repository connected to Render

### Step 1: Create New Web Service

1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `backend` directory

### Step 2: Configure Build Settings

**Build Command:**

```bash
npm install && npm run build && npm run migrate:latest
```

**Start Command:**

```bash
npm start
```

**Environment:**

- Node

**Region:**

- Singapore (closest to Australia)

**Plan:**

- Starter ($7/month) or higher

### Step 3: Add PostgreSQL Database

1. Click "New +" → "PostgreSQL"
2. Name: `horse-racing-db`
3. Database: `horse_racing`
4. Region: Singapore
5. Plan: Starter

### Step 4: Enable TimescaleDB

Connect to your database via Render's shell:

```sql
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
```

### Step 5: Add Redis

1. Click "New +" → "Redis"
2. Name: `horse-racing-redis`
3. Region: Singapore
4. Plan: Starter
5. Maxmemory Policy: `allkeys-lru`

### Step 6: Configure Environment Variables

In your web service settings, add:

| Variable                       | Value                    | Source        |
| ------------------------------ | ------------------------ | ------------- |
| `NODE_ENV`                     | `production`             | Manual        |
| `PORT`                         | `3001`                   | Manual        |
| `DB_HOST`                      | -                        | From Database |
| `DB_PORT`                      | -                        | From Database |
| `DB_NAME`                      | -                        | From Database |
| `DB_USER`                      | -                        | From Database |
| `DB_PASSWORD`                  | -                        | From Database |
| `REDIS_HOST`                   | -                        | From Redis    |
| `REDIS_PORT`                   | -                        | From Redis    |
| `REDIS_PASSWORD`               | -                        | From Redis    |
| `JWT_SECRET`                   | Generate                 | Auto-generate |
| `ODDS_API_KEY`                 | Your key                 | Manual        |
| `OPENAI_API_KEY`               | Your key                 | Manual        |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Your JSON                | Manual        |
| `SENTRY_DSN`                   | Your DSN                 | Manual        |
| `FRONTEND_URL`                 | `https://yourdomain.com` | Manual        |

### Step 7: Deploy

Render automatically deploys when you push to your connected branch.

### Step 8: Configure Custom Domain

1. Go to Settings → Custom Domain
2. Add `api.yourdomain.com`
3. Configure DNS:

```
Type: CNAME
Name: api
Value: your-service.onrender.com
```

---

## Database Setup

### PostgreSQL Configuration

#### Enable Required Extensions

```sql
-- Connect to your database
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

#### Create Hypertables

Migrations will automatically create hypertables, but you can verify:

```sql
-- Check if odds_snapshots is a hypertable
SELECT * FROM timescaledb_information.hypertables
WHERE hypertable_name = 'odds_snapshots';
```

#### Configure Connection Pooling

For Railway:

- Default connection pooling is enabled
- Max connections: 20 (configurable)

For Render:

- Use connection pooling via `DB_POOL_MAX` environment variable
- Recommended: 20 connections

### Redis Configuration

#### Memory Policy

Set eviction policy for Redis:

```bash
# Railway
railway run redis-cli CONFIG SET maxmemory-policy allkeys-lru

# Render (configured in dashboard)
```

#### Persistence

Configure Redis persistence:

```bash
# Enable AOF persistence
railway run redis-cli CONFIG SET appendonly yes
```

---

## Environment Variables

### Required Variables

| Variable         | Description       | Example                                 |
| ---------------- | ----------------- | --------------------------------------- |
| `NODE_ENV`       | Environment       | `production`                            |
| `PORT`           | Server port       | `3001`                                  |
| `DB_HOST`        | PostgreSQL host   | Auto-set by platform                    |
| `DB_PORT`        | PostgreSQL port   | `5432`                                  |
| `DB_NAME`        | Database name     | `horse_racing`                          |
| `DB_USER`        | Database user     | Auto-set by platform                    |
| `DB_PASSWORD`    | Database password | Auto-set by platform                    |
| `REDIS_HOST`     | Redis host        | Auto-set by platform                    |
| `REDIS_PORT`     | Redis port        | `6379`                                  |
| `REDIS_PASSWORD` | Redis password    | Auto-set by platform                    |
| `JWT_SECRET`     | JWT signing key   | Generate with `openssl rand -base64 32` |
| `FRONTEND_URL`   | Frontend URL      | `https://yourdomain.com`                |

### Optional Variables

| Variable                       | Description           | Default                |
| ------------------------------ | --------------------- | ---------------------- |
| `ODDS_API_KEY`                 | The Odds API key      | Required for odds      |
| `OPENAI_API_KEY`               | OpenAI API key        | Required for sentiment |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase credentials  | Required for push      |
| `SENTRY_DSN`                   | Sentry error tracking | Optional               |
| `LOG_LEVEL`                    | Logging level         | `info`                 |
| `DB_POOL_MAX`                  | Max DB connections    | `20`                   |

### Generating Secrets

```bash
# JWT Secret
openssl rand -base64 32

# API Key (if needed)
openssl rand -hex 32
```

---

## Post-Deployment

### 1. Verify Health Endpoint

```bash
curl https://your-api-url.com/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "database": "connected",
  "redis": "connected"
}
```

### 2. Run Database Migrations

```bash
# Railway
railway run npm run migrate:latest

# Render (runs automatically in build command)
```

### 3. Verify Database Connection

```bash
# Railway
railway run npm run migrate:status

# Check tables exist
railway connect postgresql
\dt
```

### 4. Test API Endpoints

```bash
# Test races endpoint
curl https://your-api-url.com/api/races

# Test bookmakers endpoint
curl https://your-api-url.com/api/bookmakers
```

### 5. Configure CORS

Update `FRONTEND_URL` to match your production domain:

```bash
railway variables set FRONTEND_URL=https://yourdomain.com
```

### 6. Start Background Jobs

Background jobs (odds collection, news aggregation) start automatically with the server.

Verify in logs:

```bash
# Railway
railway logs

# Render
# View logs in dashboard
```

### 7. Update Frontend API URL

Update Vercel environment variable:

```bash
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-api-url.com/api
```

---

## Monitoring

### Application Logs

**Railway:**

```bash
railway logs --follow
```

**Render:**

- View in dashboard under "Logs" tab
- Enable log streaming

### Metrics

**Railway:**

- View metrics in dashboard
- CPU, Memory, Network usage

**Render:**

- View metrics in dashboard
- Response times, error rates

### Sentry Error Tracking

1. Configure `SENTRY_DSN` environment variable
2. View errors at https://sentry.io
3. Set up alerts for critical errors

### Prometheus Metrics

Access metrics endpoint:

```bash
curl https://your-api-url.com/metrics
```

### Database Monitoring

**Railway:**

```bash
railway connect postgresql
```

**Render:**

- Use Render dashboard
- Connect via external tools

**Useful queries:**

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('horse_racing'));

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Redis Monitoring

```bash
# Railway
railway run redis-cli INFO

# Check memory usage
railway run redis-cli INFO memory

# Check connected clients
railway run redis-cli CLIENT LIST
```

---

## Troubleshooting

### Build Failures

**Issue:** TypeScript compilation errors

**Solution:**

```bash
# Check TypeScript locally
npm run type-check

# Fix errors and redeploy
```

**Issue:** Migration failures

**Solution:**

```bash
# Check migration status
railway run npm run migrate:status

# Rollback if needed
railway run npm run migrate:rollback

# Re-run migrations
railway run npm run migrate:latest
```

### Runtime Errors

**Issue:** Database connection failures

**Solution:**

1. Verify database is running
2. Check connection string environment variables
3. Verify network connectivity
4. Check connection pool settings

**Issue:** Redis connection failures

**Solution:**

1. Verify Redis is running
2. Check Redis host/port/password
3. Test connection: `railway run redis-cli PING`

**Issue:** Out of memory errors

**Solution:**

1. Upgrade plan for more memory
2. Optimize database queries
3. Implement pagination
4. Clear Redis cache

### Performance Issues

**Issue:** Slow API responses

**Solution:**

1. Check database query performance
2. Add database indexes
3. Implement caching
4. Optimize N+1 queries

**Issue:** High CPU usage

**Solution:**

1. Profile application
2. Optimize background jobs
3. Reduce polling frequency
4. Scale horizontally

### Database Issues

**Issue:** Connection pool exhausted

**Solution:**

```bash
# Increase pool size
railway variables set DB_POOL_MAX=50
```

**Issue:** Disk space full

**Solution:**

1. Implement data retention policies
2. Archive old data
3. Upgrade storage plan

---

## Scaling

### Horizontal Scaling

**Railway:**

```bash
# Scale to multiple instances
railway scale --replicas 3
```

**Render:**

- Upgrade to Pro plan
- Enable auto-scaling in dashboard

### Database Scaling

**Read Replicas:**

- Add read replicas for analytics queries
- Configure in Railway/Render dashboard

**Connection Pooling:**

- Use PgBouncer for connection pooling
- Configure max connections

### Redis Scaling

**Increase Memory:**

- Upgrade Redis plan
- Implement cache eviction policies

**Redis Cluster:**

- For high availability
- Available on higher plans

---

## Backup and Recovery

### Database Backups

**Railway:**

- Automatic daily backups
- Manual backups: `railway backup create`
- Restore: `railway backup restore <backup-id>`

**Render:**

- Automatic daily backups (retained 7 days)
- Manual backups in dashboard
- Point-in-time recovery available

### Manual Backup

```bash
# Export database
railway run pg_dump -Fc > backup.dump

# Restore database
railway run pg_restore -d horse_racing backup.dump
```

### Redis Backup

```bash
# Create snapshot
railway run redis-cli BGSAVE

# Export data
railway run redis-cli --rdb dump.rdb
```

---

## Security Checklist

- [ ] All environment variables set securely
- [ ] JWT secret is strong and unique
- [ ] Database password is strong
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled
- [ ] Helmet security headers configured
- [ ] SSL/TLS enabled (automatic on Railway/Render)
- [ ] Sentry error tracking configured
- [ ] Database backups enabled
- [ ] Non-root user in Docker container
- [ ] Secrets not committed to repository

---

## Cost Optimization

### Railway Pricing

- **Starter**: $5/month (500 hours)
- **Developer**: $10/month (1000 hours)
- **Team**: $20/month (2000 hours)

**Tips:**

- Use sleep mode for non-production environments
- Monitor usage in dashboard
- Optimize database queries to reduce CPU

### Render Pricing

- **Starter**: $7/month per service
- **Standard**: $25/month per service
- **Pro**: $85/month per service

**Tips:**

- Use free tier for development
- Combine services where possible
- Implement caching to reduce database load

---

## Maintenance

### Regular Tasks

**Daily:**

- Monitor error rates in Sentry
- Check application logs for issues

**Weekly:**

- Review performance metrics
- Check database size and growth
- Verify backup success

**Monthly:**

- Update dependencies
- Review and optimize slow queries
- Analyze cost and usage

### Updates

```bash
# Update dependencies
npm update

# Test locally
npm run build
npm start

# Deploy
git push origin main
```

---

## Support and Resources

### Railway

- Documentation: https://docs.railway.app
- Discord: https://discord.gg/railway
- Support: help@railway.app

### Render

- Documentation: https://render.com/docs
- Community: https://community.render.com
- Support: support@render.com

### PostgreSQL

- Documentation: https://www.postgresql.org/docs
- TimescaleDB: https://docs.timescale.com

### Redis

- Documentation: https://redis.io/documentation
- Commands: https://redis.io/commands

---

## Deployment Checklist

Before going live:

- [ ] Database created and migrations run
- [ ] Redis instance configured
- [ ] All environment variables set
- [ ] Health endpoint responding
- [ ] API endpoints tested
- [ ] CORS configured for production domain
- [ ] SSL certificate active
- [ ] Custom domain configured
- [ ] Sentry error tracking verified
- [ ] Monitoring and alerts configured
- [ ] Database backups enabled
- [ ] Background jobs running
- [ ] Frontend connected to backend
- [ ] Performance tested under load
- [ ] Security headers verified
- [ ] Documentation updated
