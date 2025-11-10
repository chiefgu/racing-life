/**
 * API Key Authentication Middleware
 * Allows external services to access API with proper authentication
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from './error-handler';
import { db } from '../db/knex';
import logger from '../config/logger';
import crypto from 'crypto';

export interface ApiKey {
  id: number;
  key_hash: string;
  name: string;
  user_id: number | null;
  permissions: string[];
  rate_limit: number;
  is_active: boolean;
  last_used_at: Date | null;
  expires_at: Date | null;
  created_at: Date;
}

/**
 * Hashes an API key for secure storage
 */
export const hashApiKey = (key: string): string => {
  return crypto.createHash('sha256').update(key).digest('hex');
};

/**
 * Generates a new API key
 */
export const generateApiKey = (): string => {
  return `rl_${crypto.randomBytes(32).toString('hex')}`;
};

/**
 * Validates API key from request header
 */
export const validateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new AppError('API key is required', 401);
    }

    if (!apiKey.startsWith('rl_')) {
      throw new AppError('Invalid API key format', 401);
    }

    // Hash the provided key
    const keyHash = hashApiKey(apiKey);

    // Look up the API key in the database
    const apiKeyRecord = await db('api_keys')
      .select('*')
      .where({ key_hash: keyHash, is_active: true })
      .first();

    if (!apiKeyRecord) {
      logger.warn({
        message: 'Invalid API key attempt',
        ip: req.ip,
        key_prefix: apiKey.substring(0, 10),
      });
      throw new AppError('Invalid API key', 401);
    }

    // Check if key has expired
    if (apiKeyRecord.expires_at && new Date(apiKeyRecord.expires_at) < new Date()) {
      throw new AppError('API key has expired', 401);
    }

    // Update last used timestamp
    await db('api_keys')
      .where({ id: apiKeyRecord.id })
      .update({ last_used_at: new Date() });

    // Attach API key info to request
    req.apiKey = {
      id: apiKeyRecord.id,
      name: apiKeyRecord.name,
      userId: apiKeyRecord.user_id,
      permissions: apiKeyRecord.permissions || [],
      rateLimit: apiKeyRecord.rate_limit,
    };

    logger.info({
      message: 'API key authenticated',
      apiKeyId: apiKeyRecord.id,
      apiKeyName: apiKeyRecord.name,
    });

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Checks if API key has specific permission
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.apiKey) {
      throw new AppError('API key authentication required', 401);
    }

    if (!req.apiKey.permissions.includes(permission) && !req.apiKey.permissions.includes('*')) {
      logger.warn({
        message: 'API key permission denied',
        apiKeyId: req.apiKey.id,
        requiredPermission: permission,
        availablePermissions: req.apiKey.permissions,
      });
      throw new AppError(`Permission denied: ${permission} required`, 403);
    }

    next();
  };
};

/**
 * Optional API key validation - allows both authenticated and unauthenticated access
 */
export const optionalApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    // No API key provided, continue without authentication
    return next();
  }

  // If API key is provided, validate it
  return validateApiKey(req, res, next);
};

// Extend Express Request type to include API key info
declare global {
  namespace Express {
    interface Request {
      apiKey?: {
        id: number;
        name: string;
        userId: number | null;
        permissions: string[];
        rateLimit: number;
      };
    }
  }
}
