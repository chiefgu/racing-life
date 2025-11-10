/**
 * Content rewriter service - uses AI to rewrite and summarize news content
 */

import logger from '../../config/logger';
import { SentimentAnalyzerService } from './sentiment-analyzer.service';
import { NewsStorageService } from './news-storage.service';
import { CacheService } from '../cache.service';
import type { NewsArticle } from '../../types/news.types';

export class ContentRewriterService {
  private analyzer: SentimentAnalyzerService;
  private storage: NewsStorageService;
  private cache: CacheService;

  constructor() {
    this.analyzer = new SentimentAnalyzerService();
    this.storage = new NewsStorageService();
    this.cache = new CacheService();
  }

  /**
   * Rewrite article content with caching
   */
  async rewriteArticle(article: NewsArticle): Promise<string | null> {
    if (!article.id) {
      logger.warn('Article has no ID, cannot rewrite content');
      return null;
    }

    // Check cache first to avoid redundant API calls
    const cacheKey = `rewritten:article:${article.id}`;
    const cached = await this.cache.get<string>(cacheKey);
    if (cached) {
      logger.debug({ articleId: article.id }, 'Using cached rewritten content');
      return cached;
    }

    try {
      // Rewrite content using AI
      const rewritten = await this.analyzer.rewriteContent(article);
      
      if (!rewritten) {
        return null;
      }

      // Store rewritten content in database
      await this.storage.updateArticleSentiment(
        article.id,
        article.sentiment?.overall || 'neutral',
        article.sentiment?.confidence || 0.5,
        rewritten
      );

      // Cache the result (7 days - content doesn't change)
      await this.cache.set(cacheKey, rewritten, 7 * 24 * 60 * 60);

      logger.info(
        {
          articleId: article.id,
          originalLength: article.content.length,
          rewrittenLength: rewritten.length,
        },
        'Rewritten article content'
      );

      return rewritten;
    } catch (error) {
      logger.error(
        {
          articleId: article.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to rewrite article content'
      );
      return null;
    }
  }

  /**
   * Extract key insights from article with caching
   */
  async extractInsights(article: NewsArticle): Promise<string[]> {
    if (!article.id) {
      logger.warn('Article has no ID, cannot extract insights');
      return [];
    }

    // Check cache first
    const cacheKey = `insights:article:${article.id}`;
    const cached = await this.cache.get<string[]>(cacheKey);
    if (cached) {
      logger.debug({ articleId: article.id }, 'Using cached insights');
      return cached;
    }

    try {
      // Extract insights using AI
      const insights = await this.analyzer.extractInsights(article);
      
      if (insights.length === 0) {
        return [];
      }

      // Cache the result (7 days)
      await this.cache.set(cacheKey, insights, 7 * 24 * 60 * 60);

      logger.info(
        {
          articleId: article.id,
          insightCount: insights.length,
        },
        'Extracted article insights'
      );

      return insights;
    } catch (error) {
      logger.error(
        {
          articleId: article.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to extract insights'
      );
      return [];
    }
  }

  /**
   * Process complete article enhancement (rewrite + insights)
   */
  async enhanceArticle(article: NewsArticle): Promise<{
    rewritten: string | null;
    insights: string[];
  }> {
    const [rewritten, insights] = await Promise.all([
      this.rewriteArticle(article),
      this.extractInsights(article),
    ]);

    return { rewritten, insights };
  }

  /**
   * Batch process article enhancements
   */
  async enhanceBatch(articles: NewsArticle[]): Promise<{
    processed: number;
    failed: number;
  }> {
    let processed = 0;
    let failed = 0;

    logger.info({ count: articles.length }, 'Starting batch content enhancement');

    for (const article of articles) {
      try {
        await this.enhanceArticle(article);
        processed++;
      } catch (error) {
        logger.error(
          {
            articleId: article.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          'Failed to enhance article in batch'
        );
        failed++;
      }
    }

    logger.info(
      { processed, failed, total: articles.length },
      'Batch content enhancement completed'
    );

    return { processed, failed };
  }

  /**
   * Process articles without rewritten content
   */
  async processUnenhancedArticles(limit = 10): Promise<{
    processed: number;
    failed: number;
  }> {
    try {
      // Get articles without rewritten content
      const articles = await this.storage.getRecentArticles(limit);
      const unenhanced = articles.filter((a) => !a.rewrittenContent);

      if (unenhanced.length === 0) {
        logger.info('No unenhanced articles found');
        return { processed: 0, failed: 0 };
      }

      logger.info(
        { count: unenhanced.length },
        'Processing unenhanced articles'
      );

      return await this.enhanceBatch(unenhanced);
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to process unenhanced articles'
      );
      return { processed: 0, failed: 0 };
    }
  }

  /**
   * Clear cache for an article (useful when content needs to be regenerated)
   */
  async clearArticleCache(articleId: string): Promise<void> {
    await Promise.all([
      this.cache.delete(`rewritten:article:${articleId}`),
      this.cache.delete(`insights:article:${articleId}`),
      this.cache.delete(`sentiment:article:${articleId}`),
    ]);

    logger.info({ articleId }, 'Cleared article cache');
  }
}
