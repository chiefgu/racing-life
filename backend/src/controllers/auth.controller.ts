import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { asyncHandler } from '../middleware/async-handler';
import { AppError } from '../middleware/error-handler';
import { db } from '../db/knex';
import { generateToken } from '../utils/jwt';

const SALT_ROUNDS = 10;

/**
 * POST /api/auth/register
 * Register a new user
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, name, password } = req.body;

  // Validate input
  if (!email || !name || !password) {
    throw new AppError('Email, name, and password are required', 400);
  }

  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  // Check if user already exists
  const existingUser = await db('users')
    .select('id')
    .where('email', email.toLowerCase())
    .first();

  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const [user] = await db('users')
    .insert({
      email: email.toLowerCase(),
      name,
      password_hash,
      role: 'user',
      subscription_tier: 'free',
    })
    .returning(['id', 'email', 'name', 'role', 'subscription_tier', 'created_at']);

  // Create user preferences
  await db('user_preferences').insert({
    user_id: user.id,
  });

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  res.status(201).json({
    status: 'success',
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscription_tier: user.subscription_tier,
        created_at: user.created_at,
      },
      token,
    },
  });
});

/**
 * POST /api/auth/login
 * Login user
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // Find user
  const user = await db('users')
    .select('id', 'email', 'name', 'password_hash', 'role', 'subscription_tier')
    .where('email', email.toLowerCase())
    .first();

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  res.json({
    status: 'success',
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscription_tier: user.subscription_tier,
      },
      token,
    },
  });
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {

  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const user = await db('users')
    .select('id', 'email', 'name', 'role', 'subscription_tier', 'created_at', 'updated_at')
    .where('id', req.user.userId)
    .first();

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get user preferences
  const preferences = await db('user_preferences')
    .select('*')
    .where('user_id', user.id)
    .first();

  // Get watchlist
  const watchlist = await db('watchlist_items')
    .select('entity_type', 'entity_name')
    .where('user_id', user.id);

  // If user is an ambassador, get ambassador details
  let ambassadorProfile = null;
  if (user.role === 'ambassador') {
    ambassadorProfile = await db('ambassadors')
      .select('id', 'name', 'slug', 'bio', 'profile_image_url', 'commission_rate', 'status')
      .where('user_id', user.id)
      .first();
  }

  res.json({
    status: 'success',
    data: {
      user,
      preferences,
      watchlist: watchlist.reduce((acc: any, item: any) => {
        if (!acc[item.entity_type]) {
          acc[item.entity_type] = [];
        }
        acc[item.entity_type].push(item.entity_name);
        return acc;
      }, {}),
      ambassador: ambassadorProfile,
    },
  });
});

/**
 * PUT /api/auth/password
 * Change user password
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { current_password, new_password } = req.body;

  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  if (!current_password || !new_password) {
    throw new AppError('Current password and new password are required', 400);
  }

  if (new_password.length < 8) {
    throw new AppError('New password must be at least 8 characters', 400);
  }

  // Get user with password hash
  const user = await db('users')
    .select('id', 'password_hash')
    .where('id', req.user.userId)
    .first();

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const isValidPassword = await bcrypt.compare(current_password, user.password_hash);

  if (!isValidPassword) {
    throw new AppError('Current password is incorrect', 401);
  }

  // Hash new password
  const new_password_hash = await bcrypt.hash(new_password, SALT_ROUNDS);

  // Update password
  await db('users')
    .where('id', user.id)
    .update({
      password_hash: new_password_hash,
      updated_at: new Date(),
    });

  res.json({
    status: 'success',
    message: 'Password updated successfully',
  });
});
