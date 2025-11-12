import express, { Request, Response } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import dotenv from 'dotenv';
import { testConnection, closePool } from './config/database';
import { testRedisConnection, closeRedis } from './config/redis';
import { initializeBookmakerClients, getBookmakerHealth } from './services/bookmaker/init';
import { initializeWebSocket, getConnectionStats } from './config/websocket';
import logger from './config/logger';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { requestLoggerMiddleware } from './middleware/request-logger.middleware';
import {
  initializeSentry,
  getSentryRequestHandler,
  getSentryTracingHandler,
  getSentryErrorHandler,
} from './config/sentry';
import racesRouter from './routes/races.routes';
import bookmakersRouter from './routes/bookmakers.routes';
import referralsRouter from './routes/referrals.routes';
import authRouter from './routes/auth.routes';
import favoritesRouter from './routes/favorites.routes';
import newsRouter from './routes/news.routes';
import watchlistRouter from './routes/watchlist.routes';
import preferencesRouter from './routes/preferences.routes';
import ambassadorsRouter from './routes/ambassadors.routes';
import articlesRouter from './routes/articles.routes';
import adminRouter from './routes/admin.routes';
import metricsRouter from './routes/metrics.routes';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Initialize Sentry (must be first)
initializeSentry(app);

// Sentry request handler (must be before other middleware)
app.use(getSentryRequestHandler());
app.use(getSentryTracingHandler());

// Security middleware
app.use(helmet());

// CORS configuration - Safari-friendly settings
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3002',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3002',
        process.env.FRONTEND_URL
      ].filter(Boolean);

      // Allow requests with no origin (like mobile apps or file://)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all origins in development
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === '/health',
    },
  })
);

// Custom request logger for structured logging
app.use(requestLoggerMiddleware);

// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
  const dbHealthy = await testConnection();
  const redisHealthy = await testRedisConnection();
  const bookmakerHealth = getBookmakerHealth();
  const wsStats = getConnectionStats();
  
  const allHealthy = dbHealthy && redisHealthy;
  const status = allHealthy ? 'ok' : 'degraded';
  
  res.json({
    status,
    timestamp: new Date().toISOString(),
    services: {
      database: dbHealthy ? 'connected' : 'disconnected',
      redis: redisHealthy ? 'connected' : 'disconnected',
      bookmakers: Object.fromEntries(bookmakerHealth),
      websocket: {
        connected: wsStats.connected,
        rooms: wsStats.rooms.length,
      },
    },
  });
});

// Metrics endpoint (for Prometheus)
app.use('/metrics', metricsRouter);

// API routes
app.use('/api/races', racesRouter);
app.use('/api/bookmakers', bookmakersRouter);
app.use('/api/referrals', referralsRouter);
app.use('/api/auth', authRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/news', newsRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/preferences', preferencesRouter);
app.use('/api/ambassadors', ambassadorsRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/admin', adminRouter);

// 404 handler
app.use(notFoundHandler);

// Sentry error handler (must be before other error handlers)
app.use(getSentryErrorHandler());

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize connections and start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database');
      process.exit(1);
    }

    // Test Redis connection
    const redisConnected = await testRedisConnection();
    if (!redisConnected) {
      console.error('Failed to connect to Redis');
      process.exit(1);
    }

    // Initialize bookmaker clients
    initializeBookmakerClients();

    // Initialize WebSocket server
    initializeWebSocket(httpServer);
    console.log('WebSocket server initialized');

    // Start HTTP server (Express + Socket.io)
    httpServer.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('WebSocket server ready for connections');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  console.log('\nShutting down gracefully...');
  
  try {
    await closePool();
    await closeRedis();
    console.log('All connections closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the server
startServer();
