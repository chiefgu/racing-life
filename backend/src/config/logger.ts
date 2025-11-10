import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
    bindings: (bindings) => {
      return {
        pid: bindings.pid,
        hostname: bindings.hostname,
        node_version: process.version,
      };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: process.env.NODE_ENV || 'development',
    service: 'horse-racing-backend',
  },
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});

// Helper functions for structured logging
export const logApiRequest = (method: string, path: string, userId?: string, duration?: number) => {
  logger.info({
    type: 'api_request',
    method,
    path,
    userId,
    duration,
  }, `${method} ${path}`);
};

export const logApiResponse = (method: string, path: string, statusCode: number, duration: number) => {
  const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  logger[logLevel]({
    type: 'api_response',
    method,
    path,
    statusCode,
    duration,
  }, `${method} ${path} - ${statusCode} (${duration}ms)`);
};

export const logOddsCollection = (
  bookmaker: string,
  raceCount: number,
  success: boolean,
  duration: number,
  error?: string
) => {
  const logLevel = success ? 'info' : 'error';
  logger[logLevel]({
    type: 'odds_collection',
    bookmaker,
    raceCount,
    success,
    duration,
    error,
  }, `Odds collection for ${bookmaker}: ${success ? 'success' : 'failed'} (${raceCount} races, ${duration}ms)`);
  
  // Record metrics
  try {
    const { recordOddsCollection } = require('./metrics');
    recordOddsCollection(bookmaker, success, duration, raceCount);
  } catch (e) {
    // Metrics not available, skip
  }
};

export const logNewsAggregation = (
  source: string,
  articleCount: number,
  success: boolean,
  duration: number,
  error?: string
) => {
  const logLevel = success ? 'info' : 'error';
  logger[logLevel]({
    type: 'news_aggregation',
    source,
    articleCount,
    success,
    duration,
    error,
  }, `News aggregation for ${source}: ${success ? 'success' : 'failed'} (${articleCount} articles, ${duration}ms)`);
  
  // Record metrics
  try {
    const { recordNewsAggregation } = require('./metrics');
    recordNewsAggregation(source, success, duration, articleCount);
  } catch (e) {
    // Metrics not available, skip
  }
};

export const logSentimentAnalysis = (
  articleId: string,
  sentiment: string,
  confidence: number,
  duration: number
) => {
  logger.info({
    type: 'sentiment_analysis',
    articleId,
    sentiment,
    confidence,
    duration,
  }, `Sentiment analysis for article ${articleId}: ${sentiment} (confidence: ${confidence}, ${duration}ms)`);
  
  // Record metrics
  try {
    const { recordSentimentAnalysis } = require('./metrics');
    recordSentimentAnalysis(sentiment, duration, true);
  } catch (e) {
    // Metrics not available, skip
  }
};

export const logDatabaseQuery = (query: string, duration: number, rowCount?: number) => {
  logger.debug({
    type: 'database_query',
    query: query.substring(0, 100), // Truncate long queries
    duration,
    rowCount,
  }, `Database query executed (${duration}ms, ${rowCount || 0} rows)`);
};

export const logCacheOperation = (operation: 'hit' | 'miss' | 'set' | 'delete', key: string) => {
  logger.debug({
    type: 'cache_operation',
    operation,
    key,
  }, `Cache ${operation}: ${key}`);
};

export const logWebSocketEvent = (event: string, clientId: string, data?: any) => {
  logger.debug({
    type: 'websocket_event',
    event,
    clientId,
    data,
  }, `WebSocket ${event} from ${clientId}`);
};

export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error({
    type: 'error',
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    ...context,
  }, error.message);
};

export { logger };
export default logger;
