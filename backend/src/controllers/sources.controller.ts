import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { AppError } from '../middleware/error-handler';
import { db } from '../db/knex';
import { getBookmakerHealth } from '../services/bookmaker/init';

/**
 * GET /api/admin/sources/scrapers
 * Get all scraper sources with health metrics
 */
export const getScraperSources = asyncHandler(async (_req: Request, res: Response) => {
  // Get all scraper sources
  const sources = await db('scraper_sources')
    .select('*')
    .orderBy('name', 'asc');

  // Get recent metrics for each source
  const sourceIds = sources.map((s) => s.id);
  
  const recentMetrics = await db('scraper_metrics')
    .select(
      'source_id',
      db.raw('COUNT(*) as total_attempts'),
      db.raw('COUNT(CASE WHEN success = true THEN 1 END) as successful_attempts'),
      db.raw('AVG(duration_ms) as avg_duration_ms'),
      db.raw('SUM(records_collected) as total_records')
    )
    .whereIn('source_id', sourceIds)
    .where('timestamp', '>=', db.raw("NOW() - INTERVAL '24 hours'"))
    .groupBy('source_id');

  const metricsMap = new Map(recentMetrics.map((m) => [m.source_id, m]));

  // Combine sources with metrics
  const sourcesWithMetrics = sources.map((source) => {
    const metrics = metricsMap.get(source.id);
    
    let last24h = null;
    if (metrics) {
      const successRate = metrics.total_attempts > 0
        ? (metrics.successful_attempts / metrics.total_attempts) * 100
        : 0;

      last24h = {
        attempts: parseInt(metrics.total_attempts),
        successful: parseInt(metrics.successful_attempts),
        successRate: parseFloat(successRate.toFixed(2)),
        avgDuration: Math.round(parseFloat(metrics.avg_duration_ms) || 0),
        totalRecords: parseInt(metrics.total_records) || 0,
      };
    }

    // Determine health status
    let status = 'unknown';
    if (source.is_active) {
      if (source.failure_count < 3) {
        status = 'healthy';
      } else if (source.failure_count < 10) {
        status = 'degraded';
      } else {
        status = 'unhealthy';
      }
    } else {
      status = 'inactive';
    }

    return {
      ...source,
      status,
      last24h,
    };
  });

  res.json({
    status: 'success',
    data: {
      sources: sourcesWithMetrics,
      count: sourcesWithMetrics.length,
    },
  });
});

/**
 * GET /api/admin/sources/bookmakers
 * Get bookmaker API health status
 */
export const getBookmakerSources = asyncHandler(async (_req: Request, res: Response) => {
  // Get bookmaker health from service
  const bookmakerHealth = getBookmakerHealth();

  // Get bookmaker details from database
  const bookmakers = await db('bookmakers')
    .select('id', 'name', 'api_enabled', 'api_endpoint', 'status')
    .where('api_enabled', true)
    .orderBy('name', 'asc');

  // Get recent odds collection metrics
  const oddsMetrics = await db('odds_snapshots')
    .select(
      'bookmaker_id',
      db.raw('COUNT(*) as snapshot_count'),
      db.raw('MAX(timestamp) as last_snapshot')
    )
    .where('timestamp', '>=', db.raw("NOW() - INTERVAL '24 hours'"))
    .groupBy('bookmaker_id');

  const oddsMetricsMap = new Map(oddsMetrics.map((m) => [m.bookmaker_id, m]));

  // Combine bookmaker data with health and metrics
  const bookmakersWithHealth = bookmakers.map((bookmaker) => {
    const health = bookmakerHealth.get(bookmaker.name) || 'unknown';
    const metrics = oddsMetricsMap.get(bookmaker.id);

    return {
      ...bookmaker,
      health,
      last24h: metrics ? {
        snapshotCount: parseInt(metrics.snapshot_count),
        lastSnapshot: metrics.last_snapshot,
      } : null,
    };
  });

  res.json({
    status: 'success',
    data: {
      bookmakers: bookmakersWithHealth,
      count: bookmakersWithHealth.length,
    },
  });
});

/**
 * PUT /api/admin/sources/scrapers/:id
 * Update scraper source configuration
 */
export const updateScraperSource = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { is_active, poll_interval } = req.body;

  const source = await db('scraper_sources')
    .where('id', id)
    .first();

  if (!source) {
    throw new AppError('Scraper source not found', 404);
  }

  const updateData: any = {
    updated_at: new Date(),
  };

  if (is_active !== undefined) {
    updateData.is_active = is_active;
  }

  if (poll_interval !== undefined) {
    if (poll_interval < 1 || poll_interval > 1440) {
      throw new AppError('Poll interval must be between 1 and 1440 minutes', 400);
    }
    updateData.poll_interval = poll_interval;
  }

  const [updatedSource] = await db('scraper_sources')
    .where('id', id)
    .update(updateData)
    .returning('*');

  res.json({
    status: 'success',
    data: {
      source: updatedSource,
    },
  });
});

/**
 * POST /api/admin/sources/scrapers/:id/reset
 * Reset failure count for a scraper source
 */
export const resetScraperFailures = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const source = await db('scraper_sources')
    .where('id', id)
    .first();

  if (!source) {
    throw new AppError('Scraper source not found', 404);
  }

  const [updatedSource] = await db('scraper_sources')
    .where('id', id)
    .update({
      failure_count: 0,
      updated_at: new Date(),
    })
    .returning('*');

  res.json({
    status: 'success',
    data: {
      source: updatedSource,
    },
    message: 'Failure count reset successfully',
  });
});

/**
 * GET /api/admin/sources/scrapers/:id/metrics
 * Get detailed metrics for a specific scraper source
 */
export const getScraperMetrics = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { hours = '24' } = req.query;

  const source = await db('scraper_sources')
    .where('id', id)
    .first();

  if (!source) {
    throw new AppError('Scraper source not found', 404);
  }

  // Get metrics for the specified time period
  const metrics = await db('scraper_metrics')
    .select('*')
    .where('source_id', id)
    .where('timestamp', '>=', db.raw(`NOW() - INTERVAL '${parseInt(hours as string)} hours'`))
    .orderBy('timestamp', 'desc')
    .limit(100);

  // Calculate summary statistics
  const summary = await db('scraper_metrics')
    .select(
      db.raw('COUNT(*) as total_attempts'),
      db.raw('COUNT(CASE WHEN success = true THEN 1 END) as successful_attempts'),
      db.raw('AVG(duration_ms) as avg_duration_ms'),
      db.raw('MIN(duration_ms) as min_duration_ms'),
      db.raw('MAX(duration_ms) as max_duration_ms'),
      db.raw('SUM(records_collected) as total_records')
    )
    .where('source_id', id)
    .where('timestamp', '>=', db.raw(`NOW() - INTERVAL '${parseInt(hours as string)} hours'`))
    .first();

  const successRate = summary.total_attempts > 0
    ? (summary.successful_attempts / summary.total_attempts) * 100
    : 0;

  res.json({
    status: 'success',
    data: {
      source,
      metrics,
      summary: {
        totalAttempts: parseInt(summary.total_attempts),
        successfulAttempts: parseInt(summary.successful_attempts),
        successRate: parseFloat(successRate.toFixed(2)),
        avgDuration: Math.round(parseFloat(summary.avg_duration_ms) || 0),
        minDuration: parseInt(summary.min_duration_ms) || 0,
        maxDuration: parseInt(summary.max_duration_ms) || 0,
        totalRecords: parseInt(summary.total_records) || 0,
      },
    },
  });
});
