import { redisClient, CacheKeys, CacheTTL } from '../config/redis';

/**
 * Cache Service
 * Provides high-level caching operations with consistent error handling
 */
export class CacheService {
  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redisClient.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await redisClient.setex(key, ttl, serialized);
      } else {
        await redisClient.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length === 0) return 0;
      await redisClient.del(...keys);
      return keys.length;
    } catch (error) {
      console.error(`Cache delete pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Increment counter (for rate limiting)
   */
  async increment(key: string, ttl?: number): Promise<number> {
    try {
      const value = await redisClient.incr(key);
      if (ttl && value === 1) {
        await redisClient.expire(key, ttl);
      }
      return value;
    } catch (error) {
      console.error(`Cache increment error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Get or set pattern - fetch from cache or compute and cache
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T | null> {
    try {
      // Try to get from cache
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // Fetch fresh data
      const fresh = await fetchFn();
      
      // Cache the result
      await this.set(key, fresh, ttl);
      
      return fresh;
    } catch (error) {
      console.error(`Cache getOrSet error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Cache race odds
   */
  async cacheRaceOdds(raceId: string, odds: any): Promise<boolean> {
    const key = CacheKeys.odds.race(raceId);
    return this.set(key, odds, CacheTTL.ODDS);
  }

  /**
   * Get cached race odds
   */
  async getRaceOdds(raceId: string): Promise<any | null> {
    const key = CacheKeys.odds.race(raceId);
    return this.get(key);
  }

  /**
   * Invalidate race odds cache
   */
  async invalidateRaceOdds(raceId: string): Promise<boolean> {
    const key = CacheKeys.odds.race(raceId);
    return this.delete(key);
  }

  /**
   * Cache user session
   */
  async cacheSession(userId: string, sessionData: any): Promise<boolean> {
    const key = CacheKeys.session.user(userId);
    return this.set(key, sessionData, CacheTTL.SESSION);
  }

  /**
   * Get user session
   */
  async getSession(userId: string): Promise<any | null> {
    const key = CacheKeys.session.user(userId);
    return this.get(key);
  }

  /**
   * Delete user session
   */
  async deleteSession(userId: string): Promise<boolean> {
    const key = CacheKeys.session.user(userId);
    return this.delete(key);
  }

  /**
   * Check rate limit
   */
  async checkRateLimit(
    identifier: string,
    limit: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number }> {
    try {
      const now = new Date();
      const windowKey = `${identifier}:${Math.floor(now.getTime() / 1000 / windowSeconds)}`;
      
      const current = await this.increment(windowKey, windowSeconds);
      
      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true, remaining: limit };
    }
  }
}

export const cacheService = new CacheService();
