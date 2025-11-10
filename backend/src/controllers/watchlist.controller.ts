import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { AppError } from '../middleware/error-handler';
import { db } from '../db/knex';

/**
 * GET /api/watchlist
 * Get user's watchlist
 */
export const getWatchlist = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const watchlistItems = await db('watchlist_items')
    .select('id', 'entity_type', 'entity_name', 'created_at')
    .where('user_id', req.user.userId)
    .orderBy('created_at', 'desc');

  // Group by entity type
  const watchlist = watchlistItems.reduce((acc: any, item: any) => {
    if (!acc[item.entity_type]) {
      acc[item.entity_type] = [];
    }
    acc[item.entity_type].push({
      id: item.id,
      name: item.entity_name,
      createdAt: item.created_at,
    });
    return acc;
  }, {});

  res.json({
    status: 'success',
    data: {
      watchlist,
      items: watchlistItems,
    },
  });
});

/**
 * POST /api/watchlist
 * Add item to watchlist
 */
export const addToWatchlist = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { entity_type, entity_name } = req.body;

  if (!entity_type || !entity_name) {
    throw new AppError('Entity type and name are required', 400);
  }

  if (!['horse', 'jockey', 'trainer', 'meeting'].includes(entity_type)) {
    throw new AppError('Invalid entity type', 400);
  }

  // Check if already exists
  const existing = await db('watchlist_items')
    .select('id')
    .where({
      user_id: req.user.userId,
      entity_type,
      entity_name,
    })
    .first();

  if (existing) {
    throw new AppError('Item already in watchlist', 409);
  }

  const [item] = await db('watchlist_items')
    .insert({
      user_id: req.user.userId,
      entity_type,
      entity_name,
    })
    .returning(['id', 'entity_type', 'entity_name', 'created_at']);

  res.status(201).json({
    status: 'success',
    data: {
      item: {
        id: item.id,
        entityType: item.entity_type,
        entityName: item.entity_name,
        createdAt: item.created_at,
      },
    },
  });
});

/**
 * DELETE /api/watchlist/:id
 * Remove item from watchlist
 */
export const removeFromWatchlist = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { id } = req.params;

  const item = await db('watchlist_items')
    .select('id')
    .where({
      id,
      user_id: req.user.userId,
    })
    .first();

  if (!item) {
    throw new AppError('Watchlist item not found', 404);
  }

  await db('watchlist_items')
    .where('id', id)
    .delete();

  res.json({
    status: 'success',
    message: 'Item removed from watchlist',
  });
});

/**
 * GET /api/watchlist/check
 * Check if items are in watchlist
 */
export const checkWatchlist = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { entity_type, entity_names } = req.query;

  if (!entity_type || !entity_names) {
    throw new AppError('Entity type and names are required', 400);
  }

  const names = (entity_names as string).split(',');

  const items = await db('watchlist_items')
    .select('entity_name')
    .where('user_id', req.user.userId)
    .where('entity_type', entity_type as string)
    .whereIn('entity_name', names);

  const inWatchlist = items.map((item: any) => item.entity_name);

  res.json({
    status: 'success',
    data: {
      inWatchlist,
    },
  });
});
