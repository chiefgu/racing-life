/**
 * News aggregator service - orchestrates news collection from multiple sources
 */

import logger, { logNewsAggregation } from '../../config/logger';
import { NewsScraperService } from './news-scraper.service';
import { NewsStorageService } from './news-storage.service';
import { EntityExtractorService } from './entity-extractor.service';
import { getEnabledSources } from '../../config/news-sources';
import type { NewsSource, NewsArticle } from '../../types/news.types';

export class NewsAggregatorService {
  private scraper: NewsScraperService;
  private storage: NewsStorageService;
  private entityExtractor: EntityExtractorService;

  constructor() {
    this.scraper = new NewsScraperService();
    this.storage = new NewsStorageService();
    this.entityExtractor = new EntityExtractorService();
  }

  /**
   * Aggregate news from all enabled sources
   */
  async aggregateNews(): Promise<{ collected: number; stored: number }> {
    const sources = getEnabledSources();
    
    if (sources.length === 0) {
      logger.warn('No enabled news sources found');
      return { collected: 0, stored: 0 };
    }

    logger.info({ sourceCount: sources.length }, 'Starting news aggregation');

    const allArticles: NewsArticle[] = [];

    // Scrape all sources
    for (const source of sources) {
      try {
        const articles = await this.scraper.scrapeSource(source);
        allArticles.push(...articles);
      } catch (error) {
        logger.error(
          {
            sourceId: source.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          'Failed to scrape source, continuing with others'
        );
      }
    }

    // Remove duplicates
    const uniqueArticles = this.scraper.detectDuplicates(allArticles);

    // Store articles and extract entities
    const storedIds: string[] = [];
    for (const article of uniqueArticles) {
      const articleId = await this.storage.storeArticle(article);
      if (articleId) {
        storedIds.push(articleId);
        
        // Extract and store entities
        try {
          article.id = articleId;
          await this.entityExtractor.extractAndStore(article, this.storage);
        } catch (error) {
          logger.error(
            {
              articleId,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            'Failed to extract entities'
          );
        }
      }
    }

    logger.info(
      {
        collected: uniqueArticles.length,
        stored: storedIds.length,
        duplicates: allArticles.length - uniqueArticles.length,
      },
      'News aggregation completed'
    );

    return {
      collected: uniqueArticles.length,
      stored: storedIds.length,
    };
  }

  /**
   * Aggregate news from a specific source
   */
  async aggregateFromSource(source: NewsSource): Promise<{ collected: number; stored: number }> {
    const startTime = Date.now();
    logger.info({ sourceId: source.id }, 'Aggregating news from source');

    try {
      const articles = await this.scraper.scrapeSource(source);
      const uniqueArticles = this.scraper.detectDuplicates(articles);
      
      // Store articles and extract entities
      const storedIds: string[] = [];
      for (const article of uniqueArticles) {
        const articleId = await this.storage.storeArticle(article);
        if (articleId) {
          storedIds.push(articleId);
          
          // Extract and store entities
          try {
            article.id = articleId;
            await this.entityExtractor.extractAndStore(article, this.storage);
          } catch (error) {
            logger.error(
              {
                articleId,
                error: error instanceof Error ? error.message : 'Unknown error',
              },
              'Failed to extract entities'
            );
          }
        }
      }

      const duration = Date.now() - startTime;
      
      // Log structured news aggregation
      logNewsAggregation(source.id, storedIds.length, true, duration);

      logger.info(
        {
          sourceId: source.id,
          collected: uniqueArticles.length,
          stored: storedIds.length,
        },
        'Source aggregation completed'
      );

      return {
        collected: uniqueArticles.length,
        stored: storedIds.length,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Log failed news aggregation
      logNewsAggregation(source.id, 0, false, duration, errorMessage);
      
      logger.error(
        {
          sourceId: source.id,
          error: errorMessage,
        },
        'Failed to aggregate from source'
      );
      throw error;
    }
  }

  /**
   * Get recent articles
   */
  async getRecentArticles(limit = 50): Promise<NewsArticle[]> {
    return this.storage.getRecentArticles(limit);
  }

  /**
   * Get article by ID
   */
  async getArticleById(id: string): Promise<NewsArticle | null> {
    return this.storage.getArticleById(id);
  }
}
