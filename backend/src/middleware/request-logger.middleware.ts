import { Request, Response, NextFunction } from 'express';
import { logApiRequest, logApiResponse } from '../config/logger';
import { recordHttpRequest } from '../config/metrics';

/**
 * Middleware to log API requests and responses with timing
 */
export const requestLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();
  
  // Extract user ID from request if available
  const userId = (req as any).user?.id;
  
  // Log request
  logApiRequest(req.method, req.path, userId);
  
  // Capture response
  const originalSend = res.send;
  res.send = function (data: any): Response {
    const duration = Date.now() - startTime;
    
    // Log response
    logApiResponse(req.method, req.path, res.statusCode, duration);
    
    // Record metrics (skip /metrics and /health endpoints)
    if (req.path !== '/metrics' && req.path !== '/health') {
      recordHttpRequest(req.method, req.path, res.statusCode, duration);
    }
    
    // Call original send
    return originalSend.call(this, data);
  };
  
  next();
};
