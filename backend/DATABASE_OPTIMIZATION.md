# Racing Life Database Optimization & Caching Guide

## Overview

This document outlines the comprehensive database performance optimizations and caching strategies implemented for the Racing Life application.

## Table of Contents

1. [Performance Indexes](#performance-indexes)
2. [Caching Strategy](#caching-strategy)
3. [Query Optimizations](#query-optimizations)
4. [Database Monitoring](#database-monitoring)
5. [Cache Warming](#cache-warming)
6. [Performance Testing](#performance-testing)
7. [Best Practices](#best-practices)

---

## Performance Indexes

### Migration: `20251109112327_add_performance_indexes.ts`

This migration adds 40+ strategic indexes across all tables to optimize query performance.

#### Index Categories

**1. Foreign Key Indexes**

- Automatically created for JOIN operations
- Speeds up relational queries by 10-100x

**2. Timestamp Indexes**

- `created_at`, `updated_at`, `published_at`
- Critical for time-based queries and sorting
- Uses DESC order for recent-first queries

**3. Status/State Indexes**

- Filters like `status = 'active'`, `is_active = true`
- Partial indexes for common states (e.g., only active records)

**4. Composite Indexes**

- Multiple columns used together in queries
- Example: `(status, start_time)` for upcoming races
- Order matters: most selective column first

**5. Partial Indexes**

- Index only rows matching a condition
- Smaller, faster, and more efficient
- Example: `WHERE status = 'published'` for articles

#### Key Indexes Added

```sql
-- Upcoming races optimization
CREATE INDEX idx_races_status_start_time
ON races(status, start_time ASC)
WHERE status = 'upcoming';

-- Latest odds lookup
CREATE INDEX idx_odds_race_horse_bookmaker
ON odds_snapshots(race_id, horse_id, bookmaker_id, timestamp DESC);

-- Active bookmakers with API
CREATE INDEX idx_bookmakers_active_api
ON bookmakers(status, api_enabled, rating DESC)
WHERE status = 'active';

-- Entity name search (case-insensitive)
CREATE INDEX idx_news_entities_name_lower
ON news_article_entities(LOWER(entity_name), entity_type, article_id);

-- Published articles by date
CREATE INDEX idx_articles_published_date
ON articles(status, published_at DESC)
WHERE status = 'published';
```

### Running the Migration

```bash
npm run migrate:latest
```

### Verifying Index Usage

```sql
-- Check if index is being used
EXPLAIN ANALYZE
SELECT * FROM races
WHERE status = 'upcoming'
ORDER BY start_time ASC
LIMIT 50;

-- Should show: Index Scan using idx_races_status_start_time
```

---

## Caching Strategy

### Redis Cache Layers

#### 1. **API Response Cache** (`cache.middleware.ts`)

Caches entire HTTP responses with intelligent key generation.

```typescript
import { cacheResponse, CachePresets } from './middleware/cache.middleware';

// Usage in routes
router.get('/races', cacheResponse(CachePresets.RACES), getRaces);
router.get('/odds/:id', cacheResponse(CachePresets.ODDS), getRaceOdds);
router.get('/news', cacheResponse(CachePresets.NEWS), getNews);
```

**Cache Presets:**

| Preset    | TTL    | Use Case           |
| --------- | ------ | ------------------ |
| SHORT     | 2 min  | Odds, live data    |
| MEDIUM    | 5 min  | Races, news        |
| LONG      | 15 min | Reference data     |
| VERY_LONG | 1 hour | Static data        |
| USER      | 5 min  | User-specific data |

**Features:**

- Automatic cache key generation from URL + query params
- User-specific caching with `varyByUser`
- Query param filtering with `excludeQuery`
- Cache hit/miss headers (`X-Cache`, `X-Cache-Key`)
- Automatic invalidation on mutations

#### 2. **Database Query Cache** (`cache.service.ts`)

Manual caching for expensive database queries.

```typescript
// Example: Cache race odds
const cacheKey = `odds:race:${raceId}`;
const cached = await cacheService.get(cacheKey);

if (cached) {
  return cached; // Cache HIT
}

// Fetch from database
const odds = await db('odds_snapshots')...;

// Store in cache
await cacheService.set(cacheKey, odds, 120); // 2 minutes
```

#### 3. **Session Cache**

User sessions stored in Redis instead of database.

```typescript
// Store session
await cacheService.cacheSession(userId, sessionData);

// Retrieve session
const session = await cacheService.getSession(userId);

// Delete session (logout)
await cacheService.deleteSession(userId);
```

#### 4. **Rate Limiting Cache**

Redis-based rate limiting for API protection.

```typescript
const rateLimit = await cacheService.checkRateLimit(
  `api:${ip}`,
  100, // limit
  60 // window in seconds
);

if (!rateLimit.allowed) {
  return res.status(429).json({ error: 'Too many requests' });
}
```

### Cache Keys Convention

```
{namespace}:{entity}:{id}:{suffix}

Examples:
- odds:race:abc123
- cache:races:upcoming
- session:user:def456
- ratelimit:api:endpoint:/races:192.168.1.1
```

### Cache Invalidation Strategies

**1. Time-Based (TTL)**

- Most common approach
- Automatic expiration
- Good for frequently changing data

**2. Event-Based**

- Invalidate on data mutations
- Use `invalidateCacheOnMutation` middleware
- Pattern-based deletion

```typescript
// Invalidate all race caches when race is updated
app.put('/races/:id', invalidateCacheOnMutation(['cache:races:*', 'odds:race:*']), updateRace);
```

**3. Manual Invalidation**

```typescript
// Invalidate specific cache
await cacheService.delete('odds:race:abc123');

// Invalidate by pattern
await cacheService.deletePattern('odds:race:*');
```

---

## Query Optimizations

### Before Optimization

```typescript
// ❌ N+1 Query Problem
const races = await db('races').select('*');
for (const race of races) {
  const entries = await db('race_entries').where('race_id', race.id);
  // N+1: 1 query for races + N queries for entries
}
```

### After Optimization

```typescript
// ✅ Single Query with JOIN
const races = await db('races')
  .select('races.*', db.raw('COUNT(DISTINCT race_entries.id) as runner_count'))
  .leftJoin('race_entries', 'races.id', 'race_entries.race_id')
  .groupBy('races.id')
  .orderBy('races.start_time', 'asc')
  .limit(50);
```

### Optimization Techniques

**1. Eager Loading**

- Use JOINs instead of separate queries
- Fetch related data in a single query
- Reduces round trips to database

**2. Pagination**

- Always use LIMIT and OFFSET
- Return total count for frontend
- Add `hasMore` flag

```typescript
const limit = Math.min(parseInt(req.query.limit) || 50, 100);
const offset = parseInt(req.query.offset) || 0;

const [data, totalCount] = await Promise.all([
  db('races').limit(limit).offset(offset),
  db('races').count('* as count').first(),
]);

res.json({
  data,
  count: data.length,
  total: totalCount.count,
  hasMore: offset + data.length < totalCount.count,
});
```

**3. Selective Column Selection**

- Only SELECT needed columns
- Reduces data transfer
- Improves query performance

```typescript
// ❌ Fetching all columns
await db('races').select('*');

// ✅ Only needed columns
await db('races').select('id', 'name', 'start_time');
```

**4. Query Batching**

- Use Promise.all() for parallel queries
- Reduces total execution time

```typescript
const [race, entries, odds] = await Promise.all([
  db('races').where('id', raceId).first(),
  db('race_entries').where('race_id', raceId),
  db('odds_snapshots').where('race_id', raceId),
]);
```

**5. Subquery Optimization**

- Use window functions instead of correlated subqueries
- Leverage PostgreSQL's advanced features

```typescript
// Get latest odds using window function
db.raw(
  `
  SELECT DISTINCT ON (horse_id, bookmaker_id)
    horse_id, bookmaker_id, win_odds, timestamp
  FROM odds_snapshots
  WHERE race_id = ?
  ORDER BY horse_id, bookmaker_id, timestamp DESC
`,
  [raceId]
);
```

---

## Database Monitoring

### Query Performance Tracking

**File:** `utils/db-monitor.ts`

#### Features

1. **Slow Query Detection**
   - Automatically logs queries > 1 second
   - Includes stack traces
   - Stores up to 100 recent slow queries

2. **Query Statistics**
   - Total queries executed
   - Average query duration
   - Query count per request

3. **Connection Pool Monitoring**
   - Active connections
   - Idle connections
   - Waiting connections

4. **Database Health Checks**
   - Connection status
   - Response time
   - Cache hit rate

#### Usage

```typescript
import { DatabaseMonitor, initializeDatabaseMonitoring } from './utils/db-monitor';

// Initialize monitoring
initializeDatabaseMonitoring();

// Get health status
const health = await DatabaseMonitor.checkHealth();
console.log(health);
// {
//   isConnected: true,
//   responseTime: 12,
//   activeConnections: 5,
//   poolStats: { total: 20, used: 5, idle: 15, waiting: 0 },
//   slowQueries: 2
// }

// Get slow queries
const slowQueries = DatabaseMonitor.getSlowQueries(10);

// Get database statistics
const stats = await DatabaseMonitor.getDatabaseStats();
```

### Query Logger Middleware

**File:** `middleware/query-logger.middleware.ts`

Tracks queries per HTTP request and adds performance headers.

```typescript
import { queryLogger } from './middleware/query-logger.middleware';

// Add to Express app
app.use(
  queryLogger({
    logSlowQueries: true,
    slowQueryThreshold: 1000, // 1 second
    logAllQueries: false,
    logToConsole: true,
  })
);
```

**Response Headers:**

```
X-Query-Count: 5
X-Query-Time: 234ms
X-Query-Avg: 46.8ms
X-Query-Slowest: 150ms
```

### Admin Health Endpoints

**File:** `routes/db-health.routes.ts`

```bash
# Check health
GET /api/db-health

# Get comprehensive stats (admin only)
GET /api/db-health/stats

# Get slow queries (admin only)
GET /api/db-health/slow-queries?limit=50

# Get table sizes (admin only)
GET /api/db-health/table-sizes

# Get index usage (admin only)
GET /api/db-health/index-usage

# Get cache hit rate (admin only)
GET /api/db-health/cache-hit-rate

# Explain query (admin only)
POST /api/db-health/explain
{
  "query": "SELECT * FROM races WHERE status = 'upcoming'",
  "analyze": true
}
```

---

## Cache Warming

**File:** `services/cache-warming.service.ts`

Pre-populates cache with frequently accessed data.

### What Gets Warmed

1. **Upcoming Races** (next 24 hours)
2. **Active Bookmakers** (all + individual)
3. **Latest News** (50 most recent)
4. **Active Ambassadors**
5. **Popular Race Odds** (next 6 hours)

### Usage

```typescript
import { cacheWarmingService } from './services/cache-warming.service';

// Warm all caches once
await cacheWarmingService.warmAll();

// Start automatic warming (every 10 minutes)
cacheWarmingService.startAutomaticWarming(10);

// Warm specific race odds
await cacheWarmingService.warmRaceOdds(raceId);

// Refresh specific cache type
await cacheWarmingService.refreshCache('races');

// Stop automatic warming
cacheWarmingService.stopAutomaticWarming();
```

### Integration

Add to your application startup:

```typescript
// src/index.ts
import { cacheWarmingService } from './services/cache-warming.service';
import { initializeDatabaseMonitoring } from './utils/db-monitor';

// Initialize monitoring
initializeDatabaseMonitoring();

// Start cache warming
cacheWarmingService.startAutomaticWarming(10); // every 10 minutes

// Warm cache immediately on startup
cacheWarmingService.warmAll().catch(console.error);
```

---

## Performance Testing

**File:** `scripts/performance-test.ts`

Comprehensive test suite for database and cache performance.

### Running Tests

```bash
# Run performance tests
npx tsx src/scripts/performance-test.ts
```

### What It Tests

1. **Cache Operations**
   - Set performance
   - Get (hit/miss)
   - Delete performance

2. **Database Queries**
   - Upcoming races
   - Race with entries
   - Latest odds
   - News articles
   - Bookmakers
   - Complex joins

3. **Index Effectiveness**
   - Indexed queries
   - Composite indexes
   - Partial indexes

4. **Pagination**
   - First page vs. deep pagination
   - Performance degradation

### Sample Output

```
Starting Performance Tests...

Running: Cache Set Operation...
✓ Cache Set Operation - 2ms (0 queries)

Running: Get Upcoming Races (No Cache)...
✓ Get Upcoming Races (No Cache) - 45ms (1 queries)

Running: Get Latest Race Odds...
✓ Get Latest Race Odds - 89ms (1 queries)

================================================================================
PERFORMANCE TEST SUMMARY
================================================================================

Total Tests: 12
Successful: 12
Failed: 0

Average Duration: 52.33ms
Average Queries: 0.83

Slowest Tests:
1. Complex Join Query: 145ms (1 queries)
2. Get Latest Race Odds: 89ms (1 queries)
3. Get Upcoming Races: 45ms (1 queries)

Fastest Tests:
1. Cache Set Operation: 2ms (0 queries)
2. Cache Get (HIT): 3ms (0 queries)
3. Cache Delete: 2ms (0 queries)

--- Database Statistics ---

Health:
  Connected: true
  Response Time: 8ms
  Active Connections: 2
  Pool: 2/20 used

Query Stats:
  Total Queries: 10
  Average Duration: 42.50ms
  Slow Queries: 0
  Cache Hit Rate: 95.23%

Largest Tables:
  1. odds_snapshots: 245 MB (1,234,567 rows)
  2. news_articles: 89 MB (45,678 rows)
  3. races: 12 MB (8,901 rows)
```

---

## Best Practices

### 1. Always Use Indexes

```typescript
// ❌ Unindexed query - full table scan
await db('races').where('meeting_location', 'Melbourne');

// ✅ Indexed query - fast lookup
await db('races')
  .where('status', 'upcoming') // indexed
  .where('meeting_date', today) // indexed
  .orderBy('start_time'); // indexed
```

### 2. Cache Expensive Queries

```typescript
// ❌ No caching - hits DB every time
const odds = await db('odds_snapshots')...;

// ✅ With caching - hits DB once, then cache
const cacheKey = `odds:race:${raceId}`;
const odds = await cacheService.getOrSet(
  cacheKey,
  () => db('odds_snapshots')...,
  120 // 2 minutes TTL
);
```

### 3. Use Pagination

```typescript
// ❌ Fetching all rows - slow and memory intensive
const all = await db('news_articles').select('*');

// ✅ Paginated - fast and efficient
const page = await db('news_articles').limit(50).offset(0);
```

### 4. Batch Operations

```typescript
// ❌ N queries in loop
for (const id of raceIds) {
  await db('races').where('id', id).first();
}

// ✅ Single query with IN
const races = await db('races').whereIn('id', raceIds);
```

### 5. Monitor Performance

```typescript
// Add query logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(queryLogger({ logAllQueries: true }));
}

// Enable database monitoring
initializeDatabaseMonitoring();

// Regular health checks
setInterval(async () => {
  const health = await DatabaseMonitor.checkHealth();
  if (!health.isConnected) {
    console.error('Database connection lost!');
  }
}, 60000); // every minute
```

### 6. Cache Invalidation

```typescript
// Invalidate related caches on mutation
router.put(
  '/races/:id',
  invalidateCacheOnMutation(['cache:races:*', `odds:race:${req.params.id}`]),
  updateRace
);
```

### 7. Use Transactions

```typescript
// ❌ Multiple separate queries
await db('races').where('id', raceId).update({ status: 'resulted' });
await db('odds_snapshots').where('race_id', raceId).delete();

// ✅ Transaction - atomic operation
await db.transaction(async (trx) => {
  await trx('races').where('id', raceId).update({ status: 'resulted' });
  await trx('odds_snapshots').where('race_id', raceId).delete();
});
```

### 8. Optimize JOINs

```typescript
// ❌ Unnecessary data in JOIN
await db('races').join('race_entries', 'races.id', 'race_entries.race_id').select('*'); // Fetches all columns from both tables

// ✅ Select only needed columns
await db('races')
  .join('race_entries', 'races.id', 'race_entries.race_id')
  .select('races.id', 'races.name', 'race_entries.horse_number');
```

---

## Performance Metrics

### Expected Performance Improvements

| Operation             | Before | After         | Improvement |
| --------------------- | ------ | ------------- | ----------- |
| Get Upcoming Races    | 250ms  | 45ms          | 82% faster  |
| Get Race Odds         | 500ms  | 15ms (cached) | 97% faster  |
| Get Latest News       | 180ms  | 60ms          | 67% faster  |
| Get Bookmakers        | 120ms  | 5ms (cached)  | 96% faster  |
| Deep Pagination (p10) | 450ms  | 150ms         | 67% faster  |

### Cache Hit Rates

Target: **> 80%** cache hit rate for frequently accessed data

- Odds data: ~90% (high frequency)
- Race listings: ~85%
- News articles: ~80%
- Bookmakers: ~95% (rarely changes)

### Database Health Targets

- **Response Time:** < 50ms for health check
- **Cache Hit Rate:** > 90%
- **Slow Queries:** < 5% of total queries
- **Connection Pool:** < 50% utilization
- **Index Scans:** > 95% of queries use indexes

---

## Troubleshooting

### High Query Times

1. Check slow query log:

   ```bash
   GET /api/db-health/slow-queries
   ```

2. Explain query to check index usage:

   ```bash
   POST /api/db-health/explain
   { "query": "SELECT ...", "analyze": true }
   ```

3. Check index usage:
   ```bash
   GET /api/db-health/index-usage
   ```

### Low Cache Hit Rate

1. Check cache hit rate:

   ```bash
   GET /api/db-health/cache-hit-rate
   ```

2. Increase `shared_buffers` in PostgreSQL config
3. Increase `work_mem` for complex queries

### Connection Pool Exhaustion

1. Check pool stats:

   ```bash
   GET /api/db-health/stats
   ```

2. Increase pool size in `database.ts`:

   ```typescript
   pool: { min: 2, max: 20 } // Increase max
   ```

3. Fix connection leaks (ensure queries complete)

---

## Monitoring Dashboard

Recommended metrics to track:

1. **Database Performance**
   - Query execution time (p50, p95, p99)
   - Slow query count
   - Connection pool usage
   - Cache hit rate

2. **Cache Performance**
   - Hit/miss ratio
   - Eviction rate
   - Memory usage

3. **API Performance**
   - Response time by endpoint
   - Queries per request
   - Cache effectiveness

4. **System Resources**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network I/O

---

## Maintenance Tasks

### Daily

- Monitor slow query log
- Check cache hit rates
- Review error logs

### Weekly

- Analyze index usage
- Review table sizes
- Check for unused indexes

### Monthly

- Run VACUUM ANALYZE on large tables
- Review and update indexes
- Performance benchmarking
- Update cache TTLs based on data

### Quarterly

- Database performance audit
- Cache strategy review
- Capacity planning

---

## Next Steps

1. ✅ Run migration to add indexes
2. ✅ Enable database monitoring
3. ✅ Add cache middleware to routes
4. ✅ Start cache warming service
5. ✅ Run performance tests
6. Monitor and optimize based on metrics

---

## Support

For issues or questions:

- Check slow query logs first
- Use EXPLAIN ANALYZE to debug queries
- Review database health dashboard
- Check cache hit rates

Remember: **Measure first, optimize second!**
