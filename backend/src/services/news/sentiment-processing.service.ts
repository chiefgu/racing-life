/**
 * Sentiment processing service - orchestrates sentiment analysis for articles
 */

import logger from '../../config/logger';
import { SentimentAnalyzerService } from './sentiment-analyzer.service';
import { NewsStorageService } from './news-storage.service';
import { CacheService } from '../cache.service';
import type { NewsArticle, SentimentScore } from '../../types/news.types';

export class SentimentProcessingService {
  private analyzer: SentimentAnalyzerService;
  private storage: NewsStorageService;
  private cache: CacheService;

  constructor() {
    this.analyzer = new SentimentAnalyzerService();
    this.storage = new NewsStorageService();
    this.cache = new CacheService();
  }

  /**
   * Process sentiment for a single article
   */
  async processArticleSentiment(article: NewsArticle): Promise<SentimentScore | null> {
    if (!article.id) {
      logger.warn('Article has no ID, cannot process sentiment');
      return null;
    }

    // Check cache first
    const cacheKey = `sentiment:article:${article.id}`;
    const cached = await this.cache.get<SentimentScore>(cacheKey);
    if (cached) {
      logger.debug({ articleId: article.id }, 'Using cached sentiment');
      return cached;
    }

    try {
      // Analyze sentiment
      const sentiment = await this.analyzer.analyzeSentiment(article);
      
      if (!sentiment) {
        return null;
      }

      // Store sentiment in database
      await this.storage.updateArticleSentiment(
        article.id,
        sentiment.overall,
        sentiment.confidence
      );

      // Update entity sentiments if available
      if (sentiment.entitySentiments && sentiment.entitySentiments.length > 0) {
        await this.storage.updateEntitySentiments(
          article.id,
          sentiment.entitySentiments.map((es) => ({
            entityName: es.entityName,
            entityType: es.entityType,
            sentiment: es.sentiment,
            confidence: es.confidence,
          }))
        );
      }

      // Cache the result (24 hours)
      await this.cache.set(cacheKey, sentiment, 24 * 60 * 60);

      logger.info(
        {
          articleId: article.id,
          overall: sentiment.overall,
          confidence: sentiment.confidence,
        },
        'Processed article sentiment'
      );

      return sentiment;
    } catch (error) {
      logger.error(
        {
          articleId: article.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to process article sentiment'
      );
      return null;
    }
  }

  /**
   * Process sentiment for multiple articles in batch
   */
  async processBatchSentiment(articles: NewsArticle[]): Promise<{
    processed: number;
    failed: number;
  }> {
    let processed = 0;
    let failed = 0;

    logger.info({ count: articles.length }, 'Starting batch sentiment processing');

    for (const article of articles) {
      try {
        const sentiment = await this.processArticleSentiment(article);
        if (sentiment) {
          processed++;
        } else {
          failed++;
        }
      } catch (error) {
        logger.error(
          {
            articleId: article.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          'Failed to process article in batch'
        );
        failed++;
      }
    }

    logger.info(
      { processed, failed, total: articles.length },
      'Batch sentiment processing completed'
    );

    return { processed, failed };
  }

  /**
   * Process articles without sentiment
   */
  async processUnanalyzedArticles(limit = 10): Promise<{
    processed: number;
    failed: number;
  }> {
    try {
      // Get articles without sentiment
      const articles = await this.storage.getRecentArticles(limit);
      const unanalyzed = articles.filter((a) => !a.sentiment);

      if (unanalyzed.length === 0) {
        logger.info('No unanalyzed articles found');
        return { processed: 0, failed: 0 };
      }

      logger.info(
        { count: unanalyzed.length },
        'Processing unanalyzed articles'
      );

      return await this.processBatchSentiment(unanalyzed);
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to process unanalyzed articles'
      );
      return { processed: 0, failed: 0 };
    }
  }

  /**
   * Get sentiment statistics
   */
  async getSentimentStats(): Promise<{
    total: number;
    positive: number;
    negative: number;
    neutral: number;
    analyzed: number;
  }> {
    // This would query the database for stats
    // For now, return placeholder
    return {
      total: 0,
      positive: 0,
      negative: 0,
      neutral: 0,
      analyzed: 0,
    };
  }
}
