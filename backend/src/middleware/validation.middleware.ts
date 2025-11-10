/**
 * Input Validation and Sanitization Middleware
 * Protects against XSS, SQL injection, and validates input data
 */

import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import mongoSanitize from 'express-mongo-sanitize';
import { AppError } from './error-handler';

/**
 * Validates request and returns errors if any
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.type === 'field' ? (err as any).path : 'unknown',
      message: err.msg,
    }));

    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errorMessages,
    });
  }

  next();
};

/**
 * Sanitize all user inputs to prevent NoSQL injection
 */
export const sanitizeInput = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ key }) => {
    console.warn(`Sanitized potentially malicious key: ${key}`);
  },
});

/**
 * Remove any HTML/script tags from string inputs
 */
export const stripHtml = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeString = (str: string): string => {
    return str.replace(/<[^>]*>/g, '');
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// Common validation chains
export const emailValidation = body('email')
  .isEmail()
  .withMessage('Please provide a valid email address')
  .normalizeEmail()
  .toLowerCase();

export const passwordValidation = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number');

export const nameValidation = body('name')
  .trim()
  .isLength({ min: 2, max: 100 })
  .withMessage('Name must be between 2 and 100 characters')
  .matches(/^[a-zA-Z\s'-]+$/)
  .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes');

export const idParamValidation = param('id')
  .isInt({ min: 1 })
  .withMessage('ID must be a positive integer');

export const slugParamValidation = param('slug')
  .matches(/^[a-z0-9-]+$/)
  .withMessage('Slug must contain only lowercase letters, numbers, and hyphens');

// Validation rules for specific endpoints
export const registerValidation: ValidationChain[] = [
  emailValidation,
  nameValidation,
  passwordValidation,
];

export const loginValidation: ValidationChain[] = [
  emailValidation,
  body('password').notEmpty().withMessage('Password is required'),
];

export const changePasswordValidation: ValidationChain[] = [
  body('current_password').notEmpty().withMessage('Current password is required'),
  passwordValidation.custom((value, { req }) => {
    if (value === req.body.current_password) {
      throw new Error('New password must be different from current password');
    }
    return true;
  }),
];

export const raceQueryValidation: ValidationChain[] = [
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in ISO 8601 format'),
  query('venue')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Venue must be between 1 and 100 characters'),
  query('status')
    .optional()
    .isIn(['upcoming', 'live', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
];

export const watchlistValidation: ValidationChain[] = [
  body('entity_type')
    .isIn(['horse', 'jockey', 'trainer', 'race'])
    .withMessage('Invalid entity type'),
  body('entity_name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Entity name must be between 1 and 200 characters'),
];

export const preferenceValidation: ValidationChain[] = [
  body('notifications_enabled')
    .optional()
    .isBoolean()
    .withMessage('Notifications enabled must be a boolean'),
  body('odds_change_threshold')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Odds change threshold must be between 0 and 100'),
  body('default_bet_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Default bet amount must be a positive number'),
];
