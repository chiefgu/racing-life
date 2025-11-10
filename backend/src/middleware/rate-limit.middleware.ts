/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse and DDoS attacks
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import logger from '../config/logger';

// General API rate limiter - 100 requests per 15 minutes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    logger.warn({
      message: 'Rate limit exceeded',
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({
      status: 'error',
      message: 'Too many requests from this IP, please try again later',
    });
  },
});

// Strict rate limiter for authentication endpoints - 5 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 requests per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later',
  },
  handler: (req: Request, res: Response) => {
    logger.warn({
      message: 'Auth rate limit exceeded',
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({
      status: 'error',
      message: 'Too many authentication attempts, please try again later',
    });
  },
});

// API key rate limiter - More permissive for authenticated API access
export const apiKeyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  keyGenerator: (req: Request) => {
    // Use API key as the rate limit key if present
    return req.headers['x-api-key'] as string || req.ip || 'unknown';
  },
  message: {
    status: 'error',
    message: 'API rate limit exceeded',
  },
});

// Odds endpoint rate limiter - More permissive for frequently accessed data
export const oddsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: {
    status: 'error',
    message: 'Too many odds requests, please slow down',
  },
});

// Registration rate limiter - Prevent spam registrations
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Max 3 registration attempts per hour
  message: {
    status: 'error',
    message: 'Too many accounts created from this IP, please try again later',
  },
  handler: (req: Request, res: Response) => {
    logger.warn({
      message: 'Registration rate limit exceeded',
      ip: req.ip,
      email: req.body.email,
    });
    res.status(429).json({
      status: 'error',
      message: 'Too many accounts created from this IP, please try again later',
    });
  },
});

// Password reset rate limiter
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Max 3 password reset attempts per hour
  message: {
    status: 'error',
    message: 'Too many password reset attempts, please try again later',
  },
});
