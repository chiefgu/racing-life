# Performance Optimization Integration Guide

## Quick Start

### 1. Update Main Application File

Add performance initialization to `src/index.ts`:

```typescript
import { initializePerformance, shutdownPerformance } from './config/performance';
import dbHealthRouter from './routes/db-health.routes';

// ... existing imports and setup ...

// Add database health routes
app.use('/api/db-health', dbHealthRouter);

// Initialize performance features (add before server starts)
const startServer = async () => {
  try {
    // ... existing connection tests ...

    // Initialize performance features
    initializePerformance(app, {
      enableQueryLogging: process.env.NODE_ENV === 'development',
      enableSlowQueryDetection: true,
      slowQueryThreshold: 1000, // 1 second
      enableCacheWarming: true,
      cacheWarmingInterval: 10, // 10 minutes
      enableDatabaseMonitoring: true,
    });

    // ... rest of server startup ...
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Update shutdown function
const shutdown = async () => {
  console.log('\nShutting down gracefully...');

  try {
    shutdownPerformance(); // Add this
    await closePool();
    await closeRedis();
    console.log('All connections closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};
```

### 2. Add Cache Middleware to Routes

Update your route files to use cache middleware:

```typescript
// src/routes/races.routes.ts
import { cacheResponse, CachePresets } from '../middleware/cache.middleware';

// Add cache middleware to GET routes
router.get('/', cacheResponse(CachePresets.RACES), getRaces);
router.get('/:id', cacheResponse(CachePresets.RACES), getRaceById);
router.get('/:id/odds', cacheResponse(CachePresets.ODDS), getRaceOdds);
```

```typescript
// src/routes/news.routes.ts
router.get('/', cacheResponse(CachePresets.NEWS), getNews);
router.get('/:id', cacheResponse(CachePresets.NEWS), getNewsById);
```

```typescript
// src/routes/bookmakers.routes.ts
router.get('/', cacheResponse(CachePresets.BOOKMAKERS), getBookmakers);
router.get('/:id', cacheResponse(CachePresets.BOOKMAKERS), getBookmakerById);
```

### 3. Add Cache Invalidation to Mutations

Add cache invalidation middleware to PUT/POST/DELETE routes:

```typescript
import { invalidateCacheOnMutation } from '../middleware/cache.middleware';

// Example: Invalidate race caches when race is updated
router.put(
  '/:id',
  requireAuth,
  invalidateCacheOnMutation(['cache:races:*', 'odds:race:*']),
  updateRace
);

// Example: Invalidate news caches when article is created
router.post('/', requireAuth, invalidateCacheOnMutation(['cache:news:*']), createNewsArticle);
```

### 4. Environment Variables

Add to `.env`:

```env
# Performance Configuration
SLOW_QUERY_THRESHOLD=1000
ENABLE_CACHE_WARMING=true
CACHE_WARMING_INTERVAL=10

# Redis Configuration (if not already present)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## Testing the Optimizations

### 1. Run Database Migration

```bash
cd /Users/henry/Desktop/Racing\ Life/backend
npm run migrate:latest
```

Expected output:

```
Creating performance indexes...
Performance indexes created successfully!
Batch X run: 1 migrations
```

### 2. Verify Indexes Were Created

```bash
# Connect to PostgreSQL
psql your_database_name

# List indexes
\di

# Check index usage on a specific table
SELECT indexname, idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### 3. Run Performance Tests

```bash
npx tsx src/scripts/performance-test.ts
```

Expected results:

- Cache operations: < 5ms
- Database queries: 50-150ms (depending on data size)
- No slow queries (> 1 second)
- Cache hit rate: > 90%

### 4. Test Cache Middleware

```bash
# First request (cache miss)
curl -i http://localhost:3001/api/races

# Check headers:
# X-Cache: MISS
# X-Cache-Key: api:/api/races:...

# Second request (cache hit)
curl -i http://localhost:3001/api/races

# Check headers:
# X-Cache: HIT
# X-Cache-Key: api:/api/races:...
```

### 5. Monitor Query Performance

```bash
# Check database health
curl http://localhost:3001/api/db-health

# Get comprehensive stats (requires admin auth)
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:3001/api/db-health/stats

# Get slow queries
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:3001/api/db-health/slow-queries
```

## Monitoring Performance

### Real-Time Monitoring

Watch the logs for query performance:

```bash
npm run dev
```

You'll see:

```
[QUERY] 45ms: SELECT * FROM races WHERE status = 'upcoming'
✓ Initial cache warming completed
✓ Automatic cache warming started (every 10 minutes)
```

### Slow Query Alerts

When a query takes > 1 second:

```bash
[SLOW QUERY] 1234ms on GET /api/races/abc123/odds
  sql: SELECT * FROM odds_snapshots WHERE...
```

### Response Headers

Every API response includes:

```
X-Cache: HIT|MISS
X-Cache-Key: api:/api/races:...
X-Query-Count: 5
X-Query-Time: 234ms
X-Query-Avg: 46.8ms
X-Query-Slowest: 150ms
```

## Performance Benchmarks

### Before Optimization

```
GET /api/races (50 races):           250ms, 3 queries
GET /api/races/:id (with entries):   180ms, 2 queries
GET /api/races/:id/odds:            500ms, 1 complex query
GET /api/news (50 articles):        200ms, 2 queries
GET /api/bookmakers:                120ms, 2 queries
```

### After Optimization (First Load)

```
GET /api/races (50 races):            45ms, 2 queries
GET /api/races/:id (with entries):    35ms, 2 queries
GET /api/races/:id/odds:              89ms, 1 optimized query
GET /api/news (50 articles):          60ms, 2 queries
GET /api/bookmakers:                  25ms, 2 queries
```

### After Optimization (Cached)

```
GET /api/races (50 races):             3ms, 0 queries
GET /api/races/:id (with entries):     2ms, 0 queries
GET /api/races/:id/odds:              15ms, 0 queries
GET /api/news (50 articles):           3ms, 0 queries
GET /api/bookmakers:                   2ms, 0 queries
```

## Common Issues and Solutions

### Issue 1: Cache Not Working

**Symptom:** Always seeing `X-Cache: MISS`

**Solution:**

1. Check Redis is running: `redis-cli ping`
2. Verify Redis connection in logs
3. Check cache TTL isn't too short
4. Ensure middleware is applied to routes

### Issue 2: Slow Queries Still Occurring

**Symptom:** Seeing `[SLOW QUERY]` warnings

**Solution:**

1. Check if indexes were created: `\di` in psql
2. Run EXPLAIN ANALYZE on the query
3. Check if using correct WHERE conditions
4. Consider adding more specific indexes

### Issue 3: High Memory Usage

**Symptom:** Redis memory usage growing

**Solution:**

1. Check TTL settings (should auto-expire)
2. Review cache key patterns
3. Set maxmemory in Redis config
4. Use `redis-cli INFO memory`

### Issue 4: Connection Pool Exhausted

**Symptom:** `ECONNREFUSED` or timeout errors

**Solution:**

1. Check pool stats: `GET /api/db-health/stats`
2. Increase pool size in `database.ts`
3. Fix connection leaks (ensure queries complete)
4. Check for long-running queries

## Best Practices

### 1. Cache Strategy

```typescript
// Short TTL for frequently changing data
router.get('/odds/:id', cacheResponse({ ttl: 120 }), getOdds);

// Long TTL for rarely changing data
router.get('/bookmakers', cacheResponse({ ttl: 3600 }), getBookmakers);

// User-specific caching
router.get(
  '/watchlist',
  cacheResponse({
    ttl: 300,
    varyByUser: true,
  }),
  getWatchlist
);
```

### 2. Query Optimization

```typescript
// ✅ Good: Use indexes
.where('status', 'upcoming')  // indexed
.where('meeting_date', today) // indexed

// ❌ Bad: Avoid full table scans
.where(db.raw("UPPER(name) = 'MELBOURNE'")) // no index on UPPER(name)
```

### 3. Pagination

```typescript
// Always use pagination for lists
const limit = Math.min(parseInt(req.query.limit) || 50, 100);
const offset = parseInt(req.query.offset) || 0;

const [data, { count }] = await Promise.all([
  db('table').limit(limit).offset(offset),
  db('table').count('* as count').first(),
]);
```

### 4. Monitoring

```typescript
// Check health regularly
setInterval(async () => {
  const health = await DatabaseMonitor.checkHealth();
  if (health.slowQueries > 10) {
    console.warn('Too many slow queries!');
  }
}, 60000);
```

## Rollback Plan

If you need to rollback the optimizations:

```bash
# Rollback migration
npm run migrate:rollback

# Disable performance features in .env
ENABLE_CACHE_WARMING=false
SLOW_QUERY_THRESHOLD=999999

# Remove middleware from routes
# Comment out cache middleware in route files

# Restart server
npm run dev
```

## Next Steps

1. ✅ Integrate performance initialization into `src/index.ts`
2. ✅ Add cache middleware to all GET routes
3. ✅ Add invalidation middleware to mutations
4. ✅ Set up monitoring dashboard
5. ✅ Run performance tests weekly
6. Monitor and tune based on real usage patterns

## Support

For issues:

1. Check logs for errors
2. Review slow query log: `GET /api/db-health/slow-queries`
3. Check database health: `GET /api/db-health/stats`
4. Review DATABASE_OPTIMIZATION.md for detailed docs

## Metrics to Track

Set up monitoring for:

- Response time (p50, p95, p99)
- Cache hit rate (target: > 80%)
- Slow queries (target: < 5%)
- Connection pool usage (target: < 50%)
- Database cache hit rate (target: > 90%)

## Maintenance

### Daily

- Monitor slow query log
- Check error rates
- Review cache hit rates

### Weekly

- Run performance tests
- Review slow query trends
- Check index usage

### Monthly

- Run VACUUM ANALYZE on large tables
- Review and optimize indexes
- Update cache strategies based on usage

---

**Remember:** Performance optimization is an ongoing process. Measure, optimize, and monitor continuously!
