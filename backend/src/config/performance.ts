/**
 * Performance Configuration
 * Central configuration for database monitoring, caching, and performance optimizations
 */

import { Express } from 'express';
import { initializeDatabaseMonitoring } from '../utils/db-monitor';
import { cacheWarmingService } from '../services/cache-warming.service';
import { queryLogger } from '../middleware/query-logger.middleware';

export interface PerformanceConfig {
  enableQueryLogging: boolean;
  enableSlowQueryDetection: boolean;
  slowQueryThreshold: number;
  enableCacheWarming: boolean;
  cacheWarmingInterval: number;
  enableDatabaseMonitoring: boolean;
}

const defaultConfig: PerformanceConfig = {
  enableQueryLogging: process.env.NODE_ENV === 'development',
  enableSlowQueryDetection: true,
  slowQueryThreshold: parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000'), // 1 second
  enableCacheWarming: process.env.ENABLE_CACHE_WARMING !== 'false',
  cacheWarmingInterval: parseInt(process.env.CACHE_WARMING_INTERVAL || '10'), // 10 minutes
  enableDatabaseMonitoring: true,
};

/**
 * Initialize all performance features
 */
export function initializePerformance(
  app: Express,
  config: Partial<PerformanceConfig> = {}
): void {
  const finalConfig: PerformanceConfig = { ...defaultConfig, ...config };

  console.log('Initializing performance features...');

  // 1. Database Monitoring
  if (finalConfig.enableDatabaseMonitoring) {
    initializeDatabaseMonitoring();
    console.log('✓ Database monitoring enabled');
  }

  // 2. Query Logging Middleware
  if (finalConfig.enableQueryLogging || finalConfig.enableSlowQueryDetection) {
    app.use(
      queryLogger({
        logSlowQueries: finalConfig.enableSlowQueryDetection,
        slowQueryThreshold: finalConfig.slowQueryThreshold,
        logAllQueries: finalConfig.enableQueryLogging,
        logToConsole: true,
      })
    );
    console.log('✓ Query logging middleware enabled');
  }

  // 3. Cache Warming
  if (finalConfig.enableCacheWarming) {
    // Initial cache warming (async, non-blocking)
    cacheWarmingService
      .warmAll()
      .then(() => console.log('✓ Initial cache warming completed'))
      .catch((error) => console.error('✗ Initial cache warming failed:', error));

    // Start automatic cache warming
    cacheWarmingService.startAutomaticWarming(finalConfig.cacheWarmingInterval);
    console.log(
      `✓ Automatic cache warming started (every ${finalConfig.cacheWarmingInterval} minutes)`
    );
  }

  console.log('Performance features initialized successfully!');
}

/**
 * Shutdown performance features
 */
export function shutdownPerformance(): void {
  console.log('Shutting down performance features...');

  // Stop cache warming
  cacheWarmingService.stopAutomaticWarming();

  console.log('Performance features shut down successfully');
}
