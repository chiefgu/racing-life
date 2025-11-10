import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { Express, Request, Response, NextFunction } from 'express';

export const initializeSentry = (_app: Express): void => {
  if (!process.env.SENTRY_DSN) {
    console.warn('SENTRY_DSN not configured, skipping Sentry initialization');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      // Enable HTTP calls tracing
      Sentry.httpIntegration(),
      // Enable Express.js middleware tracing
      Sentry.expressIntegration(),
      // Enable Profiling
      nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Capture errors
    beforeSend(event, hint) {
      // Filter out certain errors if needed
      const error = hint.originalException;

      // Don't send 404 errors to Sentry
      if (error && typeof error === 'object' && 'statusCode' in error) {
        if ((error as any).statusCode === 404) {
          return null;
        }
      }

      return event;
    },
  });

  console.log('Sentry initialized for backend');
};

export const getSentryRequestHandler = () => {
  return (_req: Request, _res: Response, next: NextFunction) => {
    next();
  };
};

export const getSentryTracingHandler = () => {
  return (_req: Request, _res: Response, next: NextFunction) => {
    next();
  };
};

export const getSentryErrorHandler = () => {
  return (err: any, _req: Request, _res: Response, next: NextFunction) => {
    // Capture error in Sentry
    Sentry.captureException(err);
    next(err);
  };
};

export { Sentry };
