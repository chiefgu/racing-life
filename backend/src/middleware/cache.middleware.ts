import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache.service';
import crypto from 'crypto';

/**
 * Cache Middleware
 * Provides HTTP response caching with intelligent cache key generation and invalidation
 */

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  varyByQuery?: boolean; // Include query params in cache key
  varyByUser?: boolean; // Include user ID in cache key
  varyByHeaders?: string[]; // Include specific headers in cache key
  excludeQuery?: string[]; // Query params to exclude from cache key
  prefix?: string; // Cache key prefix
}

/**
 * Generate cache key from request
 */
function generateCacheKey(req: Request, options: CacheOptions): string {
  const parts: string[] = [options.prefix || 'api'];

  // Add path
  parts.push(req.path);

  // Add user ID if requested
  if (options.varyByUser && req.user) {
    parts.push(`user:${req.user.userId}`);
  }

  // Add query params if requested
  if (options.varyByQuery && Object.keys(req.query).length > 0) {
    const queryParams = { ...req.query };

    // Exclude specified query params
    if (options.excludeQuery) {
      options.excludeQuery.forEach(param => {
        delete queryParams[param];
      });
    }

    // Sort keys for consistent cache keys
    const sortedQuery = Object.keys(queryParams)
      .sort()
      .reduce((acc, key) => {
        acc[key] = queryParams[key];
        return acc;
      }, {} as any);

    if (Object.keys(sortedQuery).length > 0) {
      const queryString = JSON.stringify(sortedQuery);
      parts.push(crypto.createHash('md5').update(queryString).digest('hex').substring(0, 8));
    }
  }

  // Add headers if requested
  if (options.varyByHeaders && options.varyByHeaders.length > 0) {
    const headerValues = options.varyByHeaders
      .map(header => req.get(header))
      .filter(Boolean)
      .join(':');

    if (headerValues) {
      parts.push(crypto.createHash('md5').update(headerValues).digest('hex').substring(0, 8));
    }
  }

  return parts.join(':');
}

/**
 * Cache middleware factory
 * Creates middleware that caches responses based on options
 */
export function cacheResponse(options: CacheOptions = {}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = generateCacheKey(req, options);

    try {
      // Try to get from cache
      const cached = await cacheService.get<any>(cacheKey);

      if (cached) {
        // Set cache headers
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey);

        return res.json(cached);
      }

      // Set cache miss header
      res.set('X-Cache', 'MISS');
      res.set('X-Cache-Key', cacheKey);

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = function(data: any) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Cache the response asynchronously
          cacheService.set(cacheKey, data, options.ttl).catch(err => {
            console.error('Cache set error:', err);
          });
        }

        // Call original json method
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      // On cache error, continue without caching
      next();
    }
  };
}

/**
 * Invalidate cache by pattern
 */
export async function invalidateCache(pattern: string): Promise<number> {
  try {
    return await cacheService.deletePattern(pattern);
  } catch (error) {
    console.error('Cache invalidation error:', error);
    return 0;
  }
}

/**
 * Common cache configurations
 */
export const CachePresets = {
  // Short TTL for frequently changing data (2 minutes)
  SHORT: {
    ttl: 120,
    varyByQuery: true,
  },

  // Medium TTL for moderately changing data (5 minutes)
  MEDIUM: {
    ttl: 300,
    varyByQuery: true,
  },

  // Long TTL for rarely changing data (15 minutes)
  LONG: {
    ttl: 900,
    varyByQuery: true,
  },

  // Very long TTL for static data (1 hour)
  VERY_LONG: {
    ttl: 3600,
    varyByQuery: true,
  },

  // User-specific cache
  USER: {
    ttl: 300,
    varyByQuery: true,
    varyByUser: true,
  },

  // Odds data (2 minutes, no user variation)
  ODDS: {
    ttl: 120,
    varyByQuery: true,
    prefix: 'odds',
  },

  // News data (5 minutes)
  NEWS: {
    ttl: 300,
    varyByQuery: true,
    prefix: 'news',
  },

  // Races data (5 minutes)
  RACES: {
    ttl: 300,
    varyByQuery: true,
    prefix: 'races',
  },

  // Bookmakers data (1 hour)
  BOOKMAKERS: {
    ttl: 3600,
    varyByQuery: true,
    prefix: 'bookmakers',
  },

  // User watchlist (5 minutes, user-specific)
  WATCHLIST: {
    ttl: 300,
    varyByQuery: true,
    varyByUser: true,
    prefix: 'watchlist',
  },
};

/**
 * Cache invalidation middleware
 * Automatically invalidate related caches on mutations
 */
export function invalidateCacheOnMutation(patterns: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to invalidate cache after successful mutation
    res.json = function(data: any) {
      // Only invalidate on successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Invalidate caches asynchronously
        Promise.all(patterns.map(pattern => cacheService.deletePattern(pattern)))
          .catch(err => {
            console.error('Cache invalidation error:', err);
          });
      }

      // Call original json method
      return originalJson(data);
    };

    next();
  };
}
