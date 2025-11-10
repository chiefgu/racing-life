/**
 * Security Middleware
 * Additional security measures including CSRF protection and security headers
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AppError } from './error-handler';
import logger from '../config/logger';

/**
 * CSRF Token Storage (in production, use Redis or database)
 */
const csrfTokens = new Map<string, { token: string; expiresAt: number }>();

/**
 * Generate CSRF token
 */
export const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * CSRF Protection Middleware
 * Protects against Cross-Site Request Forgery attacks
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF check for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF check for API key authenticated requests
  if (req.apiKey) {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] as string;

  if (!csrfToken) {
    logger.warn({
      message: 'CSRF token missing',
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    throw new AppError('CSRF token is required', 403);
  }

  // Validate token
  const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];
  if (!sessionId) {
    throw new AppError('Session ID is required', 403);
  }

  const storedToken = csrfTokens.get(sessionId);

  if (!storedToken) {
    throw new AppError('Invalid session', 403);
  }

  if (storedToken.expiresAt < Date.now()) {
    csrfTokens.delete(sessionId);
    throw new AppError('CSRF token has expired', 403);
  }

  if (storedToken.token !== csrfToken) {
    logger.warn({
      message: 'Invalid CSRF token',
      ip: req.ip,
      sessionId,
    });
    throw new AppError('Invalid CSRF token', 403);
  }

  next();
};

/**
 * Get or create CSRF token endpoint
 */
export const getCsrfToken = (req: Request, res: Response) => {
  const sessionId = req.cookies?.sessionId || crypto.randomBytes(16).toString('hex');
  const token = generateCsrfToken();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  csrfTokens.set(sessionId, { token, expiresAt });

  // Set session cookie
  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({
    csrfToken: token,
    sessionId,
  });
};

/**
 * Clean up expired CSRF tokens
 */
export const cleanupCsrfTokens = () => {
  const now = Date.now();
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (data.expiresAt < now) {
      csrfTokens.delete(sessionId);
    }
  }
};

// Run cleanup every hour
setInterval(cleanupCsrfTokens, 60 * 60 * 1000);

/**
 * Additional Security Headers
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Prevent browser from sending origin, path, and query string in Referer header
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // HSTS (HTTP Strict Transport Security)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
};

/**
 * SQL Injection Prevention - Validate database query inputs
 */
export const preventSqlInjection = (req: Request, res: Response, next: NextFunction) => {
  const sqlInjectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)|(-{2}|\/\*|\*\/|;)/gi;

  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return !sqlInjectionPattern.test(value);
    }
    if (Array.isArray(value)) {
      return value.every(checkValue);
    }
    if (value && typeof value === 'object') {
      return Object.values(value).every(checkValue);
    }
    return true;
  };

  // Check all input sources
  const inputs = [
    ...Object.values(req.body || {}),
    ...Object.values(req.query || {}),
    ...Object.values(req.params || {}),
  ];

  if (!inputs.every(checkValue)) {
    logger.warn({
      message: 'Potential SQL injection attempt detected',
      ip: req.ip,
      path: req.path,
      body: req.body,
      query: req.query,
      params: req.params,
    });

    throw new AppError('Invalid input detected', 400);
  }

  next();
};

/**
 * Request size limiter to prevent DOS attacks
 */
export const requestSizeLimiter = (maxSize: number = 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.headers['content-length'];

    if (contentLength && parseInt(contentLength) > maxSize) {
      logger.warn({
        message: 'Request size exceeded limit',
        ip: req.ip,
        size: contentLength,
        maxSize,
      });

      throw new AppError('Request entity too large', 413);
    }

    next();
  };
};

/**
 * IP Whitelist/Blacklist
 */
export const ipFilter = (options: { whitelist?: string[]; blacklist?: string[] }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.connection.remoteAddress || '';

    if (options.blacklist && options.blacklist.includes(clientIp)) {
      logger.warn({
        message: 'Blocked IP attempt',
        ip: clientIp,
      });
      throw new AppError('Access denied', 403);
    }

    if (options.whitelist && !options.whitelist.includes(clientIp)) {
      logger.warn({
        message: 'Non-whitelisted IP attempt',
        ip: clientIp,
      });
      throw new AppError('Access denied', 403);
    }

    next();
  };
};
