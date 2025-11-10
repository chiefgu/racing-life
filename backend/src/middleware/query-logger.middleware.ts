import { Request, Response, NextFunction } from 'express';
import { db } from '../db/knex';

/**
 * Query Performance Logger Middleware
 * Tracks and logs database query performance per request
 */

export interface QueryLog {
  sql: string;
  bindings?: any[];
  duration: number;
  timestamp: Date;
}

export interface RequestQueryStats {
  totalQueries: number;
  totalDuration: number;
  averageDuration: number;
  slowestQuery: QueryLog | null;
  queries: QueryLog[];
}

// Store query stats per request
const requestQueryStats = new WeakMap<Request, RequestQueryStats>();

/**
 * Initialize query tracking for a request
 */
function initializeQueryTracking(req: Request): RequestQueryStats {
  const stats: RequestQueryStats = {
    totalQueries: 0,
    totalDuration: 0,
    averageDuration: 0,
    slowestQuery: null,
    queries: [],
  };

  requestQueryStats.set(req, stats);
  return stats;
}

/**
 * Add query to request stats
 */
function addQueryToStats(req: Request, queryLog: QueryLog): void {
  const stats = requestQueryStats.get(req);
  if (!stats) return;

  stats.queries.push(queryLog);
  stats.totalQueries++;
  stats.totalDuration += queryLog.duration;
  stats.averageDuration = stats.totalDuration / stats.totalQueries;

  // Update slowest query
  if (!stats.slowestQuery || queryLog.duration > stats.slowestQuery.duration) {
    stats.slowestQuery = queryLog;
  }
}

/**
 * Query logger middleware
 */
export function queryLogger(options: {
  logSlowQueries?: boolean;
  slowQueryThreshold?: number;
  logAllQueries?: boolean;
  logToConsole?: boolean;
} = {}) {
  const {
    logSlowQueries = true,
    slowQueryThreshold = 1000, // 1 second
    logAllQueries = false,
    logToConsole = true,
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Initialize query tracking
    const stats = initializeQueryTracking(req);

    // Create query listeners for this request
    const queryListener = (queryData: any) => {
      queryData.__startTime = Date.now();
    };

    const queryResponseListener = (response: any, queryData: any) => {
      const duration = Date.now() - (queryData.__startTime || Date.now());

      const queryLog: QueryLog = {
        sql: queryData.sql,
        bindings: queryData.bindings,
        duration,
        timestamp: new Date(),
      };

      addQueryToStats(req, queryLog);

      // Log slow queries
      if (logSlowQueries && duration > slowQueryThreshold) {
        console.warn(`[SLOW QUERY] ${duration}ms on ${req.method} ${req.path}`, {
          sql: queryData.sql.substring(0, 200),
          bindings: queryData.bindings,
        });
      }

      // Log all queries if enabled
      if (logAllQueries && logToConsole) {
        console.log(`[QUERY] ${duration}ms: ${queryData.sql.substring(0, 100)}`);
      }
    };

    // Attach listeners
    db.on('query', queryListener);
    db.on('query-response', queryResponseListener);

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json to add query stats headers
    res.json = function(data: any) {
      const stats = requestQueryStats.get(req);

      if (stats) {
        // Add query performance headers
        res.set('X-Query-Count', stats.totalQueries.toString());
        res.set('X-Query-Time', `${stats.totalDuration}ms`);
        res.set('X-Query-Avg', `${stats.averageDuration.toFixed(2)}ms`);

        if (stats.slowestQuery) {
          res.set('X-Query-Slowest', `${stats.slowestQuery.duration}ms`);
        }

        // Log request summary if queries were slow
        if (stats.totalDuration > slowQueryThreshold || stats.totalQueries > 20) {
          console.warn(`[REQUEST STATS] ${req.method} ${req.path}`, {
            queries: stats.totalQueries,
            totalTime: `${stats.totalDuration}ms`,
            avgTime: `${stats.averageDuration.toFixed(2)}ms`,
            slowestQuery: stats.slowestQuery
              ? `${stats.slowestQuery.duration}ms: ${stats.slowestQuery.sql.substring(0, 100)}`
              : 'N/A',
          });
        }
      }

      // Remove listeners
      db.off('query', queryListener);
      db.off('query-response', queryResponseListener);

      return originalJson(data);
    };

    // Handle errors
    const originalSend = res.send.bind(res);
    res.send = function(data: any) {
      // Remove listeners on error
      db.off('query', queryListener);
      db.off('query-response', queryResponseListener);

      return originalSend(data);
    };

    next();
  };
}

/**
 * Get query stats for a request
 */
export function getRequestQueryStats(req: Request): RequestQueryStats | null {
  return requestQueryStats.get(req) || null;
}

/**
 * Query stats endpoint helper
 */
export function attachQueryStatsToResponse(req: Request, res: Response): void {
  const stats = requestQueryStats.get(req);

  if (stats && process.env.NODE_ENV === 'development') {
    res.locals.queryStats = {
      totalQueries: stats.totalQueries,
      totalDuration: stats.totalDuration,
      averageDuration: stats.averageDuration,
      slowestQuery: stats.slowestQuery
        ? {
            sql: stats.slowestQuery.sql.substring(0, 200),
            duration: stats.slowestQuery.duration,
          }
        : null,
    };
  }
}
