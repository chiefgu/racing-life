import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { AppError } from '../middleware/error-handler';
import { db } from '../db/knex';

/**
 * GET /api/preferences
 * Get user preferences
 */
export const getPreferences = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const preferences = await db('user_preferences')
    .select('*')
    .where('user_id', req.user.userId)
    .first();

  if (!preferences) {
    // Create default preferences if they don't exist
    const [newPreferences] = await db('user_preferences')
      .insert({
        user_id: req.user.userId,
      })
      .returning('*');

    res.json({
      status: 'success',
      data: {
        preferences: newPreferences,
      },
    });
    return;
  }

  res.json({
    status: 'success',
    data: {
      preferences,
    },
  });
});

/**
 * PUT /api/preferences
 * Update user preferences
 */
export const updatePreferences = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const {
    notifications_news,
    notifications_watchlist,
    email_digest_enabled,
    email_digest_time,
  } = req.body;

  // Validate email_digest_time format if provided
  if (email_digest_time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(email_digest_time)) {
    throw new AppError('Invalid time format. Use HH:MM:SS', 400);
  }

  const updateData: any = {};

  if (typeof notifications_news === 'boolean') {
    updateData.notifications_news = notifications_news;
  }

  if (typeof notifications_watchlist === 'boolean') {
    updateData.notifications_watchlist = notifications_watchlist;
  }

  if (typeof email_digest_enabled === 'boolean') {
    updateData.email_digest_enabled = email_digest_enabled;
  }

  if (email_digest_time) {
    updateData.email_digest_time = email_digest_time;
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError('No valid preferences provided', 400);
  }

  updateData.updated_at = new Date();

  const [preferences] = await db('user_preferences')
    .where('user_id', req.user.userId)
    .update(updateData)
    .returning('*');

  res.json({
    status: 'success',
    data: {
      preferences,
    },
  });
});

/**
 * POST /api/preferences/notifications/test
 * Send a test notification to verify settings
 */
export const sendTestNotification = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const user = await db('users')
    .select('email', 'name')
    .where('id', req.user.userId)
    .first();

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // In a real implementation, this would send an actual email
  // For now, we'll just simulate it
  console.log(`Test notification sent to ${user.email}`);

  res.json({
    status: 'success',
    message: 'Test notification sent successfully',
    data: {
      email: user.email,
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * POST /api/preferences/notifications/token
 * Save FCM token for push notifications
 */
export const saveFCMToken = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { fcm_token } = req.body;

  if (!fcm_token || typeof fcm_token !== 'string') {
    throw new AppError('Valid FCM token is required', 400);
  }

  // Check if token already exists for this user
  const existingToken = await db('user_fcm_tokens')
    .where('user_id', req.user.userId)
    .where('token', fcm_token)
    .first();

  if (existingToken) {
    // Update last_used timestamp
    await db('user_fcm_tokens')
      .where('id', existingToken.id)
      .update({
        last_used: new Date(),
        updated_at: new Date(),
      });

    res.json({
      status: 'success',
      message: 'FCM token updated',
    });
    return;
  }

  // Insert new token
  await db('user_fcm_tokens').insert({
    user_id: req.user.userId,
    token: fcm_token,
    last_used: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  });

  res.json({
    status: 'success',
    message: 'FCM token saved successfully',
  });
});

/**
 * DELETE /api/preferences/notifications/token
 * Delete FCM token (disable push notifications)
 */
export const deleteFCMToken = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  await db('user_fcm_tokens')
    .where('user_id', req.user.userId)
    .delete();

  res.json({
    status: 'success',
    message: 'FCM tokens deleted successfully',
  });
});
