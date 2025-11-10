/**
 * News storage service for database operations
 */

import { db } from '../../db/knex';
import logger from '../../config/logger';
import type { NewsArticle, NewsArticleEntity } from '../../types/news.types';

export class NewsStorageService {
  /**
   * Store news articles in database
   * Returns array of successfully stored article IDs
   */
  async storeArticles(articles: NewsArticle[]): Promise<string[]> {
    const storedIds: string[] = [];

    for (const article of articles) {
      try {
        const id = await this.storeArticle(article);
        if (id) {
          storedIds.push(id);
        }
      } catch (error) {
        logger.error(
          {
            url: article.url,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          'Failed to store article'
        );
      }
    }

    logger.info({ count: storedIds.length, total: articles.length }, 'Stored articles');

    return storedIds;
  }

  /**
   * Store a single article
   * Returns article ID if successful, null if duplicate
   */
  async storeArticle(article: NewsArticle): Promise<string | null> {
    try {
      // Check if article already exists by URL or content hash
      const existing = await db('news_articles')
        .where('url', article.url)
        .orWhere('content_hash', article.contentHash)
        .first();

      if (existing) {
        logger.debug({ url: article.url }, 'Article already exists, skipping');
        return null;
      }

      // Insert article
      const [inserted] = await db('news_articles')
        .insert({
          source_id: article.sourceId,
          source_name: article.sourceName,
          title: article.title,
          content: article.content,
          author: article.author,
          published_at: article.publishedAt,
          url: article.url,
          content_hash: article.contentHash,
          sentiment_overall: article.sentiment?.overall,
          sentiment_confidence: article.sentiment?.confidence,
          rewritten_content: article.rewrittenContent,
        })
        .returning('id');

      logger.debug({ id: inserted.id, url: article.url }, 'Stored new article');

      return inserted.id;
    } catch (error) {
      // Handle unique constraint violations gracefully
      if (error instanceof Error && error.message.includes('duplicate key')) {
        logger.debug({ url: article.url }, 'Duplicate article detected');
        return null;
      }
      throw error;
    }
  }

  /**
   * Store article entities
   */
  async storeArticleEntities(
    articleId: string,
    entities: NewsArticleEntity[]
  ): Promise<void> {
    if (entities.length === 0) {
      return;
    }

    try {
      await db('news_article_entities').insert(
        entities.map((entity) => ({
          article_id: articleId,
          entity_type: entity.entityType,
          entity_name: entity.entityName,
          sentiment: entity.sentiment,
          sentiment_confidence: entity.sentimentConfidence,
        }))
      );

      logger.debug({ articleId, count: entities.length }, 'Stored article entities');
    } catch (error) {
      logger.error(
        {
          articleId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to store article entities'
      );
      throw error;
    }
  }

  /**
   * Get articles by date range
   */
  async getArticlesByDateRange(startDate: Date, endDate: Date): Promise<NewsArticle[]> {
    const rows = await db('news_articles')
      .whereBetween('published_at', [startDate, endDate])
      .orderBy('published_at', 'desc');

    return rows.map(this.mapRowToArticle);
  }

  /**
   * Get articles by source
   */
  async getArticlesBySource(sourceId: string, limit = 50): Promise<NewsArticle[]> {
    const rows = await db('news_articles')
      .where('source_id', sourceId)
      .orderBy('published_at', 'desc')
      .limit(limit);

    return rows.map(this.mapRowToArticle);
  }

  /**
   * Get recent articles
   */
  async getRecentArticles(limit = 50): Promise<NewsArticle[]> {
    const rows = await db('news_articles')
      .orderBy('published_at', 'desc')
      .limit(limit);

    return rows.map(this.mapRowToArticle);
  }

  /**
   * Get article by ID with entities
   */
  async getArticleById(id: string): Promise<NewsArticle | null> {
    const row = await db('news_articles').where('id', id).first();

    if (!row) {
      return null;
    }

    const article = this.mapRowToArticle(row);

    // Load entities
    const entityRows = await db('news_article_entities').where('article_id', id);

    if (entityRows.length > 0) {
      article.entities = {
        horses: entityRows
          .filter((e) => e.entity_type === 'horse')
          .map((e) => e.entity_name),
        jockeys: entityRows
          .filter((e) => e.entity_type === 'jockey')
          .map((e) => e.entity_name),
        trainers: entityRows
          .filter((e) => e.entity_type === 'trainer')
          .map((e) => e.entity_name),
        meetings: entityRows
          .filter((e) => e.entity_type === 'meeting')
          .map((e) => e.entity_name),
      };
    }

    return article;
  }

  /**
   * Update article sentiment
   */
  async updateArticleSentiment(
    articleId: string,
    sentiment: string,
    confidence: number,
    rewrittenContent?: string
  ): Promise<void> {
    await db('news_articles').where('id', articleId).update({
      sentiment_overall: sentiment,
      sentiment_confidence: confidence,
      rewritten_content: rewrittenContent,
      updated_at: db.fn.now(),
    });

    logger.debug({ articleId, sentiment }, 'Updated article sentiment');
  }

  /**
   * Update entity sentiments for an article
   */
  async updateEntitySentiments(
    articleId: string,
    entitySentiments: Array<{
      entityName: string;
      entityType: string;
      sentiment: string;
      confidence: number;
    }>
  ): Promise<void> {
    if (entitySentiments.length === 0) {
      return;
    }

    try {
      // Update existing entities with sentiment data
      for (const entity of entitySentiments) {
        await db('news_article_entities')
          .where({
            article_id: articleId,
            entity_name: entity.entityName,
            entity_type: entity.entityType,
          })
          .update({
            sentiment: entity.sentiment,
            sentiment_confidence: entity.confidence,
          });
      }

      logger.debug(
        { articleId, count: entitySentiments.length },
        'Updated entity sentiments'
      );
    } catch (error) {
      logger.error(
        {
          articleId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to update entity sentiments'
      );
      throw error;
    }
  }

  /**
   * Map database row to NewsArticle
   */
  private mapRowToArticle(row: any): NewsArticle {
    return {
      id: row.id,
      sourceId: row.source_id,
      sourceName: row.source_name,
      title: row.title,
      content: row.content,
      author: row.author,
      publishedAt: new Date(row.published_at),
      url: row.url,
      contentHash: row.content_hash,
      sentiment: row.sentiment_overall
        ? {
            overall: row.sentiment_overall,
            confidence: parseFloat(row.sentiment_confidence || '0'),
          }
        : undefined,
      rewrittenContent: row.rewritten_content,
    };
  }
}
