import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { AppError } from '../middleware/error-handler';
import { db } from '../db/knex';

/**
 * GET /api/bookmakers
 * List all bookmakers
 */
export const getBookmakers = asyncHandler(async (req: Request, res: Response) => {
  const { status = 'active', api_enabled } = req.query;

  let query = db('bookmakers')
    .select(
      'bookmakers.*',
      db.raw('COUNT(DISTINCT bookmaker_features.id) as feature_count')
    )
    .leftJoin('bookmaker_features', 'bookmakers.id', 'bookmaker_features.bookmaker_id')
    .groupBy('bookmakers.id')
    .orderBy('bookmakers.rating', 'desc');

  if (status) {
    query = query.where('bookmakers.status', status as string);
  }

  if (api_enabled !== undefined) {
    query = query.where('bookmakers.api_enabled', api_enabled === 'true');
  }

  const bookmakers = await query;

  res.json({
    status: 'success',
    data: {
      bookmakers,
      count: bookmakers.length,
    },
  });
});

/**
 * GET /api/bookmakers/:id
 * Get bookmaker details
 */
export const getBookmakerById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Support lookup by ID or slug
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  const bookmaker = await db('bookmakers')
    .select('*')
    .where(isUuid ? 'id' : 'slug', id)
    .first();

  if (!bookmaker) {
    throw new AppError('Bookmaker not found', 404);
  }

  // Get features
  const features = await db('bookmaker_features')
    .select('feature_name', 'feature_value')
    .where('bookmaker_id', bookmaker.id);

  // Get active promotions count
  const promotionsCount = await db('promotions')
    .count('* as count')
    .where('bookmaker_id', bookmaker.id)
    .where('is_active', true)
    .where('end_date', '>', new Date())
    .first();

  res.json({
    status: 'success',
    data: {
      bookmaker: {
        ...bookmaker,
        features: features.reduce((acc: any, f: any) => {
          acc[f.feature_name] = f.feature_value;
          return acc;
        }, {}),
        active_promotions_count: parseInt(promotionsCount?.count as string || '0'),
      },
    },
  });
});

/**
 * GET /api/bookmakers/:id/promotions
 * Get current promotions for bookmaker
 */
export const getBookmakerPromotions = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { active_only = 'true' } = req.query;

  // Support lookup by ID or slug
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  const bookmaker = await db('bookmakers')
    .select('id')
    .where(isUuid ? 'id' : 'slug', id)
    .first();

  if (!bookmaker) {
    throw new AppError('Bookmaker not found', 404);
  }

  let query = db('promotions')
    .select('*')
    .where('bookmaker_id', bookmaker.id)
    .orderBy('start_date', 'desc');

  if (active_only === 'true') {
    query = query
      .where('is_active', true)
      .where(function() {
        this.whereNull('end_date')
          .orWhere('end_date', '>', new Date());
      });
  }

  const promotions = await query;

  res.json({
    status: 'success',
    data: {
      promotions,
      count: promotions.length,
    },
  });
});
