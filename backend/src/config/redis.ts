import Redis from 'ioredis';

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
};

// Main Redis client for general caching
export const redisClient = new Redis(redisConfig);

// Redis client for pub/sub (WebSocket coordination)
export const redisPub = new Redis(redisConfig);
export const redisSub = new Redis(redisConfig);

// Handle Redis connection events
redisClient.on('connect', () => {
  console.log('Redis client connected');
});

redisClient.on('ready', () => {
  console.log('Redis client ready');
});

redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

redisClient.on('close', () => {
  console.log('Redis client connection closed');
});

redisPub.on('connect', () => {
  console.log('Redis pub client connected');
});

redisSub.on('connect', () => {
  console.log('Redis sub client connected');
});

// Test Redis connection
export const testRedisConnection = async (): Promise<boolean> => {
  try {
    await redisClient.ping();
    console.log('Redis connection test successful');
    return true;
  } catch (error) {
    console.error('Redis connection test failed:', error);
    return false;
  }
};

// Graceful shutdown
export const closeRedis = async (): Promise<void> => {
  await redisClient.quit();
  await redisPub.quit();
  await redisSub.quit();
  console.log('Redis connections closed');
};

/**
 * Cache key naming conventions
 * 
 * Format: {namespace}:{entity}:{id}:{suffix}
 * 
 * Examples:
 * - odds:race:123e4567-e89b-12d3-a456-426614174000
 * - odds:race:123e4567-e89b-12d3-a456-426614174000:bookmaker:sportsbet
 * - session:user:123e4567-e89b-12d3-a456-426614174000
 * - ratelimit:scraper:tab:2024-01-15:12:30
 * - cache:news:latest
 * - cache:bookmakers:all
 */

export const CacheKeys = {
  // Odds caching (TTL: 2 minutes)
  odds: {
    race: (raceId: string) => `odds:race:${raceId}`,
    raceBookmaker: (raceId: string, bookmaker: string) => 
      `odds:race:${raceId}:bookmaker:${bookmaker}`,
    horse: (horseId: string) => `odds:horse:${horseId}`,
  },
  
  // Session management (TTL: 24 hours)
  session: {
    user: (userId: string) => `session:user:${userId}`,
    token: (token: string) => `session:token:${token}`,
  },
  
  // Rate limiting (TTL: 1 minute)
  rateLimit: {
    scraper: (source: string, timestamp: string) => 
      `ratelimit:scraper:${source}:${timestamp}`,
    api: (endpoint: string, ip: string, timestamp: string) => 
      `ratelimit:api:${endpoint}:${ip}:${timestamp}`,
  },
  
  // General caching
  cache: {
    races: {
      upcoming: () => `cache:races:upcoming`,
      byMeeting: (location: string, date: string) => 
        `cache:races:meeting:${location}:${date}`,
    },
    bookmakers: {
      all: () => `cache:bookmakers:all`,
      active: () => `cache:bookmakers:active`,
      byId: (id: string) => `cache:bookmakers:${id}`,
    },
    news: {
      latest: () => `cache:news:latest`,
      byEntity: (entityType: string, entityName: string) => 
        `cache:news:${entityType}:${entityName}`,
    },
    ambassadors: {
      all: () => `cache:ambassadors:all`,
      bySlug: (slug: string) => `cache:ambassadors:${slug}`,
    },
  },
  
  // WebSocket pub/sub channels
  pubsub: {
    oddsUpdate: (raceId: string) => `pubsub:odds:${raceId}`,
    raceStatus: (raceId: string) => `pubsub:race:status:${raceId}`,
    newsUpdate: () => `pubsub:news:update`,
  },
};

// Cache TTL constants (in seconds)
export const CacheTTL = {
  ODDS: 120,              // 2 minutes
  SESSION: 86400,         // 24 hours
  RATE_LIMIT: 60,         // 1 minute
  RACES_UPCOMING: 300,    // 5 minutes
  BOOKMAKERS: 3600,       // 1 hour
  NEWS_LATEST: 900,       // 15 minutes
  AMBASSADORS: 1800,      // 30 minutes
};
