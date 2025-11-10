/**
 * News controller - handles news article endpoints
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { AppError } from '../middleware/error-handler';
import { db } from '../db/knex';
import { cacheService } from '../services/cache.service';
import {
  NewsStorageService,
  SentimentProcessingService,
  ContentRewriterService,
} from '../services/news';

const newsStorage = new NewsStorageService();
const sentimentProcessor = new SentimentProcessingService();
const contentRewriter = new ContentRewriterService();

const CACHE_TTL = 300; // 5 minutes for news data

/**
 * GET /api/news
 * List news articles with filters
 */
export const getNews = asyncHandler(async (req: Request, res: Response) => {
  const {
    source_id,
    sentiment,
    entity_type,
    entity_name,
    start_date,
    end_date,
    limit = '50',
    offset = '0',
  } = req.query;

  // Build cache key based on query params
  const cacheKey = `news:list:${JSON.stringify(req.query)}`;
  const cached = await cacheService.get<any>(cacheKey);

  if (cached) {
    res.json({
      status: 'success',
      data: {
        articles: cached.articles,
        count: cached.count,
        cached: true,
      },
    });
    return;
  }

  let query = db('news_articles')
    .select(
      'news_articles.*',
      db.raw('COUNT(DISTINCT news_article_entities.id) as entity_count')
    )
    .leftJoin(
      'news_article_entities',
      'news_articles.id',
      'news_article_entities.article_id'
    )
    .groupBy('news_articles.id')
    .orderBy('news_articles.published_at', 'desc')
    .limit(parseInt(limit as string))
    .offset(parseInt(offset as string));

  if (source_id) {
    query = query.where('news_articles.source_id', source_id as string);
  }

  if (sentiment) {
    query = query.where('news_articles.sentiment_overall', sentiment as string);
  }

  if (start_date) {
    query = query.where('news_articles.published_at', '>=', start_date as string);
  }

  if (end_date) {
    query = query.where('news_articles.published_at', '<=', end_date as string);
  }

  // Filter by entity if specified
  if (entity_type || entity_name) {
    query = query.whereExists(function () {
      let subquery = this.select('*')
        .from('news_article_entities')
        .whereRaw('news_article_entities.article_id = news_articles.id');

      if (entity_type) {
        subquery = subquery.where('entity_type', entity_type as string);
      }

      if (entity_name) {
        subquery = subquery.where('entity_name', 'ilike', `%${entity_name}%`);
      }
    });
  }

  const articles = await query;

  // Get total count for pagination
  const countQuery = db('news_articles').count('* as count').first();
  const { count } = (await countQuery) as any;

  // Cache the result
  await cacheService.set(
    cacheKey,
    { articles, count: parseInt(count) },
    CACHE_TTL
  );

  res.json({
    status: 'success',
    data: {
      articles,
      count: parseInt(count),
      cached: false,
    },
  });
});

/**
 * GET /api/news/:id
 * Get specific article with sentiment and entities
 */
export const getNewsById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { include_insights = 'false' } = req.query;

  // Check cache first
  const cacheKey = `news:article:${id}:${include_insights}`;
  const cached = await cacheService.get<any>(cacheKey);

  if (cached) {
    res.json({
      status: 'success',
      data: cached,
    });
    return;
  }

  // Get article with entities
  const article = await newsStorage.getArticleById(id);

  if (!article) {
    throw new AppError('Article not found', 404);
  }

  // Get entity sentiments
  const entitySentiments = await db('news_article_entities')
    .select('*')
    .where('article_id', id);

  // Build response
  const response: any = {
    article,
    entitySentiments,
  };

  // Include insights if requested
  if (include_insights === 'true') {
    const insights = await contentRewriter.extractInsights(article);
    response.insights = insights;
  }

  // Cache the result
  await cacheService.set(cacheKey, response, CACHE_TTL);

  res.json({
    status: 'success',
    data: response,
  });
});

/**
 * GET /api/news/race/:raceId
 * Get news related to a specific race
 */
export const getNewsByRace = asyncHandler(async (req: Request, res: Response) => {
  const { raceId } = req.params;
  const { limit = '20' } = req.query;

  // Check cache first
  const cacheKey = `news:race:${raceId}:${limit}`;
  const cached = await cacheService.get<any>(cacheKey);

  if (cached) {
    res.json({
      status: 'success',
      data: {
        articles: cached,
        cached: true,
      },
    });
    return;
  }

  // Verify race exists
  const race = await db('races')
    .select('*')
    .where('id', raceId)
    .first();

  if (!race) {
    throw new AppError('Race not found', 404);
  }

  // Get horses, jockeys, and trainers in this race
  const raceEntities = await db('race_entries')
    .select(
      'horses.name as horse_name',
      'horses.jockey',
      'horses.trainer'
    )
    .join('horses', 'race_entries.horse_id', 'horses.id')
    .where('race_entries.race_id', raceId)
    .where('race_entries.scratched', false);

  // Extract unique entity names
  const entityNames = new Set<string>();
  raceEntities.forEach((entry: any) => {
    if (entry.horse_name) entityNames.add(entry.horse_name.toLowerCase());
    if (entry.jockey) entityNames.add(entry.jockey.toLowerCase());
    if (entry.trainer) entityNames.add(entry.trainer.toLowerCase());
  });

  // Also include meeting location
  if (race.meeting_location) {
    entityNames.add(race.meeting_location.toLowerCase());
  }

  if (entityNames.size === 0) {
    res.json({
      status: 'success',
      data: {
        articles: [],
        cached: false,
      },
    });
    return;
  }

  // Find articles mentioning these entities
  const articles = await db('news_articles')
    .select('news_articles.*')
    .distinct()
    .join(
      'news_article_entities',
      'news_articles.id',
      'news_article_entities.article_id'
    )
    .whereRaw(
      'LOWER(news_article_entities.entity_name) IN (?)',
      [Array.from(entityNames)]
    )
    .orderBy('news_articles.published_at', 'desc')
    .limit(parseInt(limit as string));

  // Cache the result
  await cacheService.set(cacheKey, articles, CACHE_TTL);

  res.json({
    status: 'success',
    data: {
      articles,
      race: {
        id: race.id,
        name: race.race_name,
        meeting_location: race.meeting_location,
        start_time: race.start_time,
      },
      cached: false,
    },
  });
});

/**
 * GET /api/news/entity/:entityName
 * Get news mentioning a specific entity (horse, jockey, trainer)
 */
export const getNewsByEntity = asyncHandler(async (req: Request, res: Response) => {
  const { entityName } = req.params;
  const { entity_type, limit = '20' } = req.query;

  // Check cache first
  const cacheKey = `news:entity:${entityName}:${entity_type}:${limit}`;
  const cached = await cacheService.get<any>(cacheKey);

  if (cached) {
    res.json({
      status: 'success',
      data: {
        articles: cached,
        cached: true,
      },
    });
    return;
  }

  let query = db('news_articles')
    .select(
      'news_articles.*',
      'news_article_entities.entity_type',
      'news_article_entities.sentiment',
      'news_article_entities.sentiment_confidence'
    )
    .join(
      'news_article_entities',
      'news_articles.id',
      'news_article_entities.article_id'
    )
    .where('news_article_entities.entity_name', 'ilike', `%${entityName}%`)
    .orderBy('news_articles.published_at', 'desc')
    .limit(parseInt(limit as string));

  if (entity_type) {
    query = query.where('news_article_entities.entity_type', entity_type as string);
  }

  const articles = await query;

  // Cache the result
  await cacheService.set(cacheKey, articles, CACHE_TTL);

  res.json({
    status: 'success',
    data: {
      articles,
      entity: entityName,
      cached: false,
    },
  });
});

/**
 * POST /api/news/:id/analyze
 * Trigger sentiment analysis for a specific article (admin only)
 */
export const analyzeArticle = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const article = await newsStorage.getArticleById(id);

  if (!article) {
    throw new AppError('Article not found', 404);
  }

  // Clear cache for this article
  await contentRewriter.clearArticleCache(id);

  // Process sentiment and rewrite content
  const [sentiment, rewritten] = await Promise.all([
    sentimentProcessor.processArticleSentiment(article),
    contentRewriter.rewriteArticle(article),
  ]);

  res.json({
    status: 'success',
    data: {
      sentiment,
      rewritten,
      message: 'Article analysis completed',
    },
  });
});

/**
 * GET /api/news/stats/sentiment
 * Get sentiment statistics across all articles
 */
export const getSentimentStats = asyncHandler(async (_req: Request, res: Response) => {
  const cacheKey = 'news:stats:sentiment';
  const cached = await cacheService.get<any>(cacheKey);

  if (cached) {
    res.json({
      status: 'success',
      data: cached,
    });
    return;
  }

  const stats = await db('news_articles')
    .select('sentiment_overall')
    .count('* as count')
    .groupBy('sentiment_overall');

  const total = await db('news_articles').count('* as count').first();

  const result = {
    total: parseInt((total as any).count),
    breakdown: stats.reduce((acc: any, stat: any) => {
      acc[stat.sentiment_overall || 'unanalyzed'] = parseInt(stat.count);
      return acc;
    }, {}),
  };

  // Cache for 10 minutes
  await cacheService.set(cacheKey, result, 600);

  res.json({
    status: 'success',
    data: result,
  });
});

/**
 * GET /api/news/personalized
 * Get personalized news feed based on user's watchlist
 */
export const getPersonalizedNews = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { limit = '50', offset = '0' } = req.query;

  // Get user's watchlist
  const watchlistItems = await db('watchlist_items')
    .select('entity_type', 'entity_name')
    .where('user_id', req.user.userId);

  if (watchlistItems.length === 0) {
    // No watchlist items, return recent news
    const articles = await db('news_articles')
      .select('*')
      .orderBy('published_at', 'desc')
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json({
      status: 'success',
      data: {
        articles,
        personalized: false,
        watchlistCount: 0,
      },
    });
    return;
  }

  // Extract entity names from watchlist
  const entityNames = watchlistItems.map((item: any) => item.entity_name.toLowerCase());

  // Find articles mentioning watchlist entities
  const articles = await db('news_articles')
    .select(
      'news_articles.*',
      db.raw('COUNT(DISTINCT news_article_entities.id) as relevance_score'),
      db.raw('ARRAY_AGG(DISTINCT news_article_entities.entity_name) as matched_entities')
    )
    .join(
      'news_article_entities',
      'news_articles.id',
      'news_article_entities.article_id'
    )
    .whereRaw(
      'LOWER(news_article_entities.entity_name) IN (?)',
      [entityNames]
    )
    .groupBy('news_articles.id')
    .orderBy('relevance_score', 'desc')
    .orderBy('news_articles.published_at', 'desc')
    .limit(parseInt(limit as string))
    .offset(parseInt(offset as string));

  // Get entity sentiments for matched articles
  const articleIds = articles.map((a: any) => a.id);
  const entitySentiments = await db('news_article_entities')
    .select('*')
    .whereIn('article_id', articleIds)
    .whereRaw('LOWER(entity_name) IN (?)', [entityNames]);

  // Attach entity sentiments to articles
  const articlesWithSentiments = articles.map((article: any) => {
    const sentiments = entitySentiments.filter(
      (es: any) => es.article_id === article.id
    );
    return {
      ...article,
      watchlistSentiments: sentiments,
    };
  });

  res.json({
    status: 'success',
    data: {
      articles: articlesWithSentiments,
      personalized: true,
      watchlistCount: watchlistItems.length,
    },
  });
});
