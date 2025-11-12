import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { AppError } from '../middleware/error-handler';
import { db } from '../db/knex';

/**
 * POST /api/favorites
 * Save user favorites from onboarding
 */
export const saveFavorites = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { jockeys = [], trainers = [], tracks = [], bookmakers = [] } = req.body;

  // Start transaction
  await db.transaction(async (trx) => {
    // Delete existing favorites for this user
    await trx('user_favorites').where('user_id', req.user!.userId).del();

    // Prepare all favorites for insertion
    const favoritesToInsert = [
      ...jockeys.map((name: string) => ({
        user_id: req.user!.userId,
        favorite_type: 'jockey',
        favorite_name: name,
      })),
      ...trainers.map((name: string) => ({
        user_id: req.user!.userId,
        favorite_type: 'trainer',
        favorite_name: name,
      })),
      ...tracks.map((name: string) => ({
        user_id: req.user!.userId,
        favorite_type: 'track',
        favorite_name: name,
      })),
      ...bookmakers.map((name: string) => ({
        user_id: req.user!.userId,
        favorite_type: 'bookmaker',
        favorite_name: name,
      })),
    ];

    // Insert all favorites
    if (favoritesToInsert.length > 0) {
      await trx('user_favorites').insert(favoritesToInsert);
    }
  });

  res.json({
    status: 'success',
    message: 'Favorites saved successfully',
  });
});

/**
 * GET /api/favorites
 * Get user favorites
 */
export const getFavorites = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const favorites = await db('user_favorites')
    .select('favorite_type', 'favorite_name', 'created_at')
    .where('user_id', req.user.userId)
    .orderBy('created_at', 'desc');

  // Group by type
  const groupedFavorites = favorites.reduce((acc: any, fav: any) => {
    if (!acc[fav.favorite_type]) {
      acc[fav.favorite_type] = [];
    }
    acc[fav.favorite_type].push(fav.favorite_name);
    return acc;
  }, {});

  res.json({
    status: 'success',
    data: {
      jockeys: groupedFavorites.jockey || [],
      trainers: groupedFavorites.trainer || [],
      tracks: groupedFavorites.track || [],
      bookmakers: groupedFavorites.bookmaker || [],
    },
  });
});

/**
 * DELETE /api/favorites/:type/:name
 * Remove a specific favorite
 */
export const removeFavorite = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { type, name } = req.params;

  const deleted = await db('user_favorites')
    .where({
      user_id: req.user.userId,
      favorite_type: type,
      favorite_name: name,
    })
    .del();

  if (!deleted) {
    throw new AppError('Favorite not found', 404);
  }

  res.json({
    status: 'success',
    message: 'Favorite removed successfully',
  });
});
