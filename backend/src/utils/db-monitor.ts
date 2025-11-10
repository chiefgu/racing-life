import { db } from '../db/knex';
import { Knex } from 'knex';

/**
 * Database Monitoring Utilities
 * Provides query performance monitoring, slow query detection, and health checks
 */

export interface QueryStats {
  query: string;
  duration: number;
  timestamp: Date;
  rows?: number;
}

export interface SlowQuery {
  query: string;
  duration: number;
  timestamp: Date;
  stackTrace?: string;
}

export interface ConnectionPoolStats {
  total: number;
  used: number;
  idle: number;
  waiting: number;
}

export interface DatabaseHealth {
  isConnected: boolean;
  responseTime: number;
  activeConnections: number;
  poolStats: ConnectionPoolStats;
  cacheHitRate?: number;
  slowQueries: number;
}

/**
 * Database Monitor Class
 */
export class DatabaseMonitor {
  private static slowQueries: SlowQuery[] = [];
  private static queryStats: QueryStats[] = [];
  private static slowQueryThreshold = 1000; // 1 second
  private static maxSlowQueries = 100;
  private static maxQueryStats = 1000;

  /**
   * Set slow query threshold in milliseconds
   */
  static setSlowQueryThreshold(ms: number): void {
    this.slowQueryThreshold = ms;
  }

  /**
   * Enable query monitoring
   */
  static enableQueryMonitoring(): void {
    // Add query event listener
    db.on('query', (queryData: any) => {
      const startTime = Date.now();

      // Store start time in query data
      queryData.__startTime = startTime;
    });

    db.on('query-response', (response: any, queryData: any, builder: any) => {
      const endTime = Date.now();
      const duration = endTime - (queryData.__startTime || endTime);

      const stats: QueryStats = {
        query: queryData.sql,
        duration,
        timestamp: new Date(),
        rows: Array.isArray(response) ? response.length : undefined,
      };

      // Add to query stats
      this.addQueryStats(stats);

      // Check if slow query
      if (duration > this.slowQueryThreshold) {
        const slowQuery: SlowQuery = {
          query: queryData.sql,
          duration,
          timestamp: new Date(),
          stackTrace: new Error().stack,
        };

        this.addSlowQuery(slowQuery);
        console.warn(`[SLOW QUERY] ${duration}ms: ${queryData.sql.substring(0, 200)}...`);
      }
    });

    db.on('query-error', (error: any, queryData: any) => {
      console.error('[QUERY ERROR]', {
        error: error.message,
        query: queryData.sql,
        bindings: queryData.bindings,
      });
    });

    console.log('Database query monitoring enabled');
  }

  /**
   * Disable query monitoring
   */
  static disableQueryMonitoring(): void {
    db.removeAllListeners('query');
    db.removeAllListeners('query-response');
    db.removeAllListeners('query-error');
    console.log('Database query monitoring disabled');
  }

  /**
   * Add query stats
   */
  private static addQueryStats(stats: QueryStats): void {
    this.queryStats.push(stats);

    // Keep only last N queries
    if (this.queryStats.length > this.maxQueryStats) {
      this.queryStats.shift();
    }
  }

  /**
   * Add slow query
   */
  private static addSlowQuery(slowQuery: SlowQuery): void {
    this.slowQueries.push(slowQuery);

    // Keep only last N slow queries
    if (this.slowQueries.length > this.maxSlowQueries) {
      this.slowQueries.shift();
    }
  }

  /**
   * Get slow queries
   */
  static getSlowQueries(limit: number = 50): SlowQuery[] {
    return this.slowQueries.slice(-limit);
  }

  /**
   * Get query statistics
   */
  static getQueryStats(limit: number = 100): QueryStats[] {
    return this.queryStats.slice(-limit);
  }

  /**
   * Get average query duration
   */
  static getAverageQueryDuration(): number {
    if (this.queryStats.length === 0) return 0;

    const total = this.queryStats.reduce((sum, stat) => sum + stat.duration, 0);
    return total / this.queryStats.length;
  }

  /**
   * Get query count
   */
  static getQueryCount(): number {
    return this.queryStats.length;
  }

  /**
   * Clear statistics
   */
  static clearStats(): void {
    this.queryStats = [];
    this.slowQueries = [];
  }

  /**
   * Get connection pool statistics
   */
  static getPoolStats(): ConnectionPoolStats {
    const pool = (db.client as any).pool;

    return {
      total: pool.max || 0,
      used: pool.numUsed() || 0,
      idle: pool.numFree() || 0,
      waiting: pool.numPendingAcquires() || 0,
    };
  }

  /**
   * Check database health
   */
  static async checkHealth(): Promise<DatabaseHealth> {
    const startTime = Date.now();

    try {
      // Test database connection
      await db.raw('SELECT 1');
      const responseTime = Date.now() - startTime;

      // Get active connections
      const activeConnections = await this.getActiveConnectionCount();

      return {
        isConnected: true,
        responseTime,
        activeConnections,
        poolStats: this.getPoolStats(),
        slowQueries: this.slowQueries.length,
      };
    } catch (error) {
      console.error('Database health check failed:', error);

      return {
        isConnected: false,
        responseTime: Date.now() - startTime,
        activeConnections: 0,
        poolStats: this.getPoolStats(),
        slowQueries: this.slowQueries.length,
      };
    }
  }

  /**
   * Get active connection count from PostgreSQL
   */
  static async getActiveConnectionCount(): Promise<number> {
    try {
      const result = await db.raw(`
        SELECT COUNT(*) as count
        FROM pg_stat_activity
        WHERE datname = current_database()
        AND state = 'active'
      `);

      return parseInt(result.rows[0]?.count || '0');
    } catch (error) {
      console.error('Failed to get active connection count:', error);
      return 0;
    }
  }

  /**
   * Get table sizes
   */
  static async getTableSizes(): Promise<Array<{ table: string; size: string; rowCount: number }>> {
    try {
      const result = await db.raw(`
        SELECT
          schemaname || '.' || tablename AS table,
          pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS size,
          n_tup_ins - n_tup_del AS row_count
        FROM pg_stat_user_tables
        ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC
        LIMIT 20
      `);

      return result.rows.map((row: any) => ({
        table: row.table,
        size: row.size,
        rowCount: parseInt(row.row_count || '0'),
      }));
    } catch (error) {
      console.error('Failed to get table sizes:', error);
      return [];
    }
  }

  /**
   * Get index usage statistics
   */
  static async getIndexUsage(): Promise<Array<{
    table: string;
    index: string;
    scans: number;
    size: string;
  }>> {
    try {
      const result = await db.raw(`
        SELECT
          schemaname || '.' || tablename AS table,
          indexname AS index,
          idx_scan AS scans,
          pg_size_pretty(pg_relation_size(schemaname || '.' || indexrelname)) AS size
        FROM pg_stat_user_indexes
        ORDER BY idx_scan ASC
        LIMIT 20
      `);

      return result.rows.map((row: any) => ({
        table: row.table,
        index: row.index,
        scans: parseInt(row.scans || '0'),
        size: row.size,
      }));
    } catch (error) {
      console.error('Failed to get index usage:', error);
      return [];
    }
  }

  /**
   * Get cache hit rate
   */
  static async getCacheHitRate(): Promise<number> {
    try {
      const result = await db.raw(`
        SELECT
          sum(heap_blks_read) as heap_read,
          sum(heap_blks_hit) as heap_hit,
          sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0) AS ratio
        FROM pg_statio_user_tables
      `);

      return parseFloat(result.rows[0]?.ratio || '0') * 100;
    } catch (error) {
      console.error('Failed to get cache hit rate:', error);
      return 0;
    }
  }

  /**
   * Get long-running queries
   */
  static async getLongRunningQueries(): Promise<Array<{
    pid: number;
    duration: string;
    query: string;
    state: string;
  }>> {
    try {
      const result = await db.raw(`
        SELECT
          pid,
          now() - pg_stat_activity.query_start AS duration,
          query,
          state
        FROM pg_stat_activity
        WHERE (now() - pg_stat_activity.query_start) > interval '5 seconds'
        AND state = 'active'
        ORDER BY duration DESC
      `);

      return result.rows.map((row: any) => ({
        pid: row.pid,
        duration: row.duration,
        query: row.query.substring(0, 200),
        state: row.state,
      }));
    } catch (error) {
      console.error('Failed to get long running queries:', error);
      return [];
    }
  }

  /**
   * Analyze query plan
   */
  static async explainQuery(query: string, analyze: boolean = false): Promise<string> {
    try {
      const prefix = analyze ? 'EXPLAIN ANALYZE' : 'EXPLAIN';
      const result = await db.raw(`${prefix} ${query}`);

      return result.rows.map((row: any) => row['QUERY PLAN']).join('\n');
    } catch (error) {
      console.error('Failed to explain query:', error);
      return `Error: ${error}`;
    }
  }

  /**
   * Get database statistics summary
   */
  static async getDatabaseStats(): Promise<{
    health: DatabaseHealth;
    tableSizes: Array<{ table: string; size: string; rowCount: number }>;
    indexUsage: Array<{ table: string; index: string; scans: number; size: string }>;
    cacheHitRate: number;
    longRunningQueries: Array<{ pid: number; duration: string; query: string; state: string }>;
    queryStats: {
      total: number;
      averageDuration: number;
      slowQueries: number;
    };
  }> {
    const [health, tableSizes, indexUsage, cacheHitRate, longRunningQueries] = await Promise.all([
      this.checkHealth(),
      this.getTableSizes(),
      this.getIndexUsage(),
      this.getCacheHitRate(),
      this.getLongRunningQueries(),
    ]);

    return {
      health,
      tableSizes,
      indexUsage,
      cacheHitRate,
      longRunningQueries,
      queryStats: {
        total: this.queryStats.length,
        averageDuration: this.getAverageQueryDuration(),
        slowQueries: this.slowQueries.length,
      },
    };
  }
}

/**
 * Query performance tracking middleware
 */
export function trackQueryPerformance() {
  return (queryBuilder: Knex.QueryBuilder) => {
    const startTime = Date.now();

    queryBuilder.on('query-response', () => {
      const duration = Date.now() - startTime;

      if (duration > DatabaseMonitor['slowQueryThreshold']) {
        console.warn(`[SLOW QUERY] ${duration}ms`);
      }
    });

    return queryBuilder;
  };
}

/**
 * Initialize database monitoring
 */
export function initializeDatabaseMonitoring(): void {
  DatabaseMonitor.enableQueryMonitoring();
  DatabaseMonitor.setSlowQueryThreshold(1000); // 1 second

  console.log('Database monitoring initialized');
}
