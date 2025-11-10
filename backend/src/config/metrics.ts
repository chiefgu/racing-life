import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

/**
 * Prometheus metrics configuration
 */

// Create a Registry to register metrics
export const register = new Registry();

// Add default metrics (CPU, memory, etc.)
collectDefaultMetrics({
  register,
  prefix: 'horse_racing_',
});

// HTTP Metrics
export const httpRequestDuration = new Histogram({
  name: 'horse_racing_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

export const httpRequestTotal = new Counter({
  name: 'horse_racing_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Odds Collection Metrics
export const oddsCollectionTotal = new Counter({
  name: 'horse_racing_odds_collection_total',
  help: 'Total number of odds collection attempts',
  labelNames: ['bookmaker', 'status'],
  registers: [register],
});

export const oddsCollectionDuration = new Histogram({
  name: 'horse_racing_odds_collection_duration_seconds',
  help: 'Duration of odds collection in seconds',
  labelNames: ['bookmaker'],
  buckets: [1, 5, 10, 30, 60, 120],
  registers: [register],
});

export const oddsCollected = new Counter({
  name: 'horse_racing_odds_collected_total',
  help: 'Total number of odds collected',
  labelNames: ['bookmaker'],
  registers: [register],
});

export const oddsStored = new Counter({
  name: 'horse_racing_odds_stored_total',
  help: 'Total number of odds stored in database',
  labelNames: ['bookmaker'],
  registers: [register],
});

// News Aggregation Metrics
export const newsAggregationTotal = new Counter({
  name: 'horse_racing_news_aggregation_total',
  help: 'Total number of news aggregation attempts',
  labelNames: ['source', 'status'],
  registers: [register],
});

export const newsAggregationDuration = new Histogram({
  name: 'horse_racing_news_aggregation_duration_seconds',
  help: 'Duration of news aggregation in seconds',
  labelNames: ['source'],
  buckets: [1, 5, 10, 30, 60],
  registers: [register],
});

export const articlesCollected = new Counter({
  name: 'horse_racing_articles_collected_total',
  help: 'Total number of articles collected',
  labelNames: ['source'],
  registers: [register],
});

export const articlesStored = new Counter({
  name: 'horse_racing_articles_stored_total',
  help: 'Total number of articles stored in database',
  labelNames: ['source'],
  registers: [register],
});

// Sentiment Analysis Metrics
export const sentimentAnalysisTotal = new Counter({
  name: 'horse_racing_sentiment_analysis_total',
  help: 'Total number of sentiment analysis attempts',
  labelNames: ['status'],
  registers: [register],
});

export const sentimentAnalysisDuration = new Histogram({
  name: 'horse_racing_sentiment_analysis_duration_seconds',
  help: 'Duration of sentiment analysis in seconds',
  buckets: [0.5, 1, 2, 5, 10],
  registers: [register],
});

export const sentimentDistribution = new Counter({
  name: 'horse_racing_sentiment_distribution_total',
  help: 'Distribution of sentiment analysis results',
  labelNames: ['sentiment'],
  registers: [register],
});

// OpenAI API Metrics
export const openaiApiCalls = new Counter({
  name: 'horse_racing_openai_api_calls_total',
  help: 'Total number of OpenAI API calls',
  labelNames: ['operation', 'status'],
  registers: [register],
});

export const openaiTokensUsed = new Counter({
  name: 'horse_racing_openai_tokens_used_total',
  help: 'Total number of OpenAI tokens used',
  labelNames: ['operation'],
  registers: [register],
});

export const openaiCost = new Counter({
  name: 'horse_racing_openai_cost_usd_total',
  help: 'Total estimated cost of OpenAI API usage in USD',
  labelNames: ['operation'],
  registers: [register],
});

// Database Metrics
export const databaseQueryDuration = new Histogram({
  name: 'horse_racing_database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register],
});

export const databaseConnectionsActive = new Gauge({
  name: 'horse_racing_database_connections_active',
  help: 'Number of active database connections',
  registers: [register],
});

export const databaseConnectionsIdle = new Gauge({
  name: 'horse_racing_database_connections_idle',
  help: 'Number of idle database connections',
  registers: [register],
});

// Cache Metrics
export const cacheOperations = new Counter({
  name: 'horse_racing_cache_operations_total',
  help: 'Total number of cache operations',
  labelNames: ['operation', 'status'],
  registers: [register],
});

export const cacheHitRate = new Gauge({
  name: 'horse_racing_cache_hit_rate',
  help: 'Cache hit rate (0-1)',
  registers: [register],
});

// WebSocket Metrics
export const websocketConnections = new Gauge({
  name: 'horse_racing_websocket_connections_active',
  help: 'Number of active WebSocket connections',
  registers: [register],
});

export const websocketMessages = new Counter({
  name: 'horse_racing_websocket_messages_total',
  help: 'Total number of WebSocket messages',
  labelNames: ['event', 'direction'],
  registers: [register],
});

// Business Metrics
export const userRegistrations = new Counter({
  name: 'horse_racing_user_registrations_total',
  help: 'Total number of user registrations',
  registers: [register],
});

export const affiliateClicks = new Counter({
  name: 'horse_racing_affiliate_clicks_total',
  help: 'Total number of affiliate link clicks',
  labelNames: ['bookmaker'],
  registers: [register],
});

export const affiliateConversions = new Counter({
  name: 'horse_racing_affiliate_conversions_total',
  help: 'Total number of affiliate conversions',
  labelNames: ['bookmaker'],
  registers: [register],
});

export const ambassadorArticles = new Counter({
  name: 'horse_racing_ambassador_articles_total',
  help: 'Total number of ambassador articles published',
  labelNames: ['status'],
  registers: [register],
});

// System Health Metrics
export const systemHealth = new Gauge({
  name: 'horse_racing_system_health',
  help: 'System health status (1 = healthy, 0 = unhealthy)',
  labelNames: ['component'],
  registers: [register],
});

// Helper functions to update metrics
export const recordHttpRequest = (method: string, route: string, statusCode: number, duration: number) => {
  httpRequestTotal.inc({ method, route, status_code: statusCode });
  httpRequestDuration.observe({ method, route, status_code: statusCode }, duration / 1000);
};

export const recordOddsCollection = (bookmaker: string, success: boolean, duration: number, count: number) => {
  oddsCollectionTotal.inc({ bookmaker, status: success ? 'success' : 'failure' });
  oddsCollectionDuration.observe({ bookmaker }, duration / 1000);
  if (success) {
    oddsCollected.inc({ bookmaker }, count);
  }
};

export const recordNewsAggregation = (source: string, success: boolean, duration: number, count: number) => {
  newsAggregationTotal.inc({ source, status: success ? 'success' : 'failure' });
  newsAggregationDuration.observe({ source }, duration / 1000);
  if (success) {
    articlesCollected.inc({ source }, count);
  }
};

export const recordSentimentAnalysis = (sentiment: string, duration: number, success: boolean) => {
  sentimentAnalysisTotal.inc({ status: success ? 'success' : 'failure' });
  sentimentAnalysisDuration.observe(duration / 1000);
  if (success) {
    sentimentDistribution.inc({ sentiment });
  }
};

export const recordCacheOperation = (operation: 'hit' | 'miss' | 'set' | 'delete', success: boolean) => {
  cacheOperations.inc({ operation, status: success ? 'success' : 'failure' });
};

export const updateSystemHealth = (component: string, healthy: boolean) => {
  systemHealth.set({ component }, healthy ? 1 : 0);
};
