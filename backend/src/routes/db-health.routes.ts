import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { DatabaseMonitor } from '../utils/db-monitor';
import { cacheService } from '../services/cache.service';
import { CacheTTL } from '../config/redis';
import { requireAdmin } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/db-health
 * Get database health status
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const health = await DatabaseMonitor.checkHealth();

    res.json({
      status: 'success',
      data: health,
    });
  })
);

/**
 * GET /api/db-health/stats
 * Get comprehensive database statistics (admin only)
 */
router.get(
  '/stats',
  requireAdmin,
  asyncHandler(async (req, res) => {
    // Check cache first
    const cacheKey = 'admin:db-stats';
    const cached = await cacheService.get<any>(cacheKey);

    if (cached) {
      return res.json({
        status: 'success',
        data: cached,
        cached: true,
      });
    }

    const stats = await DatabaseMonitor.getDatabaseStats();

    // Cache for 1 minute
    await cacheService.set(cacheKey, stats, 60);

    res.json({
      status: 'success',
      data: stats,
      cached: false,
    });
  })
);

/**
 * GET /api/db-health/slow-queries
 * Get slow queries (admin only)
 */
router.get(
  '/slow-queries',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { limit = '50' } = req.query;
    const slowQueries = DatabaseMonitor.getSlowQueries(parseInt(limit as string));

    res.json({
      status: 'success',
      data: {
        slowQueries,
        count: slowQueries.length,
        threshold: 1000, // 1 second
      },
    });
  })
);

/**
 * GET /api/db-health/query-stats
 * Get query statistics (admin only)
 */
router.get(
  '/query-stats',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const stats = {
      totalQueries: DatabaseMonitor.getQueryCount(),
      averageDuration: DatabaseMonitor.getAverageQueryDuration(),
      poolStats: DatabaseMonitor.getPoolStats(),
    };

    res.json({
      status: 'success',
      data: stats,
    });
  })
);

/**
 * GET /api/db-health/table-sizes
 * Get table sizes (admin only)
 */
router.get(
  '/table-sizes',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const tableSizes = await DatabaseMonitor.getTableSizes();

    res.json({
      status: 'success',
      data: {
        tables: tableSizes,
        count: tableSizes.length,
      },
    });
  })
);

/**
 * GET /api/db-health/index-usage
 * Get index usage statistics (admin only)
 */
router.get(
  '/index-usage',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const indexUsage = await DatabaseMonitor.getIndexUsage();

    res.json({
      status: 'success',
      data: {
        indexes: indexUsage,
        count: indexUsage.length,
      },
    });
  })
);

/**
 * GET /api/db-health/cache-hit-rate
 * Get database cache hit rate (admin only)
 */
router.get(
  '/cache-hit-rate',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const cacheHitRate = await DatabaseMonitor.getCacheHitRate();

    res.json({
      status: 'success',
      data: {
        cacheHitRate,
        recommendation:
          cacheHitRate < 90
            ? 'Consider increasing shared_buffers or work_mem'
            : 'Cache hit rate is healthy',
      },
    });
  })
);

/**
 * GET /api/db-health/long-queries
 * Get currently running long queries (admin only)
 */
router.get(
  '/long-queries',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const longQueries = await DatabaseMonitor.getLongRunningQueries();

    res.json({
      status: 'success',
      data: {
        queries: longQueries,
        count: longQueries.length,
      },
    });
  })
);

/**
 * POST /api/db-health/explain
 * Explain a query (admin only)
 */
router.post(
  '/explain',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { query, analyze = false } = req.body;

    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'Query is required',
      });
    }

    const explanation = await DatabaseMonitor.explainQuery(query, analyze);

    res.json({
      status: 'success',
      data: {
        query,
        explanation,
        analyzed: analyze,
      },
    });
  })
);

/**
 * POST /api/db-health/clear-stats
 * Clear query statistics (admin only)
 */
router.post(
  '/clear-stats',
  requireAdmin,
  asyncHandler(async (req, res) => {
    DatabaseMonitor.clearStats();

    res.json({
      status: 'success',
      message: 'Query statistics cleared',
    });
  })
);

export default router;
