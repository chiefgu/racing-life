/**
 * News scraper service for collecting articles from RSS feeds and web sources
 */

import Parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createHash } from 'crypto';
import logger from '../../config/logger';
import type { NewsSource, NewsArticle } from '../../types/news.types';

export class NewsScraperService {
  private rssParser: Parser;

  constructor() {
    this.rssParser = new Parser({
      timeout: 10000,
      headers: {
        'User-Agent': 'HorseRacingPlatform/1.0 (News Aggregator)',
      },
    });
  }

  /**
   * Scrape news from a single source
   */
  async scrapeSource(source: NewsSource): Promise<NewsArticle[]> {
    try {
      logger.info({ sourceId: source.id, type: source.type }, 'Scraping news source');

      if (source.type === 'rss') {
        return await this.scrapeRSS(source);
      } else {
        return await this.scrapeWeb(source);
      }
    } catch (error) {
      logger.error(
        { sourceId: source.id, error: error instanceof Error ? error.message : 'Unknown error' },
        'Failed to scrape news source'
      );
      return [];
    }
  }

  /**
   * Scrape RSS feed
   */
  private async scrapeRSS(source: NewsSource): Promise<NewsArticle[]> {
    try {
      const feed = await this.rssParser.parseURL(source.url);
      const articles: NewsArticle[] = [];

      for (const item of feed.items) {
        if (!item.title || !item.link) {
          continue;
        }

        const content = this.cleanContent(item.contentSnippet || item.content || '');
        const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();

        const article: NewsArticle = {
          sourceId: source.id,
          sourceName: source.name,
          title: item.title,
          content,
          author: item.creator || item.author,
          publishedAt,
          url: item.link,
          contentHash: this.generateContentHash(item.title, content),
        };

        articles.push(article);
      }

      logger.info(
        { sourceId: source.id, count: articles.length },
        'Successfully scraped RSS feed'
      );

      return articles;
    } catch (error) {
      logger.error(
        { sourceId: source.id, error: error instanceof Error ? error.message : 'Unknown error' },
        'Failed to parse RSS feed'
      );
      throw error;
    }
  }

  /**
   * Scrape web page
   */
  private async scrapeWeb(source: NewsSource): Promise<NewsArticle[]> {
    if (!source.selectors) {
      throw new Error(`No selectors defined for web source: ${source.id}`);
    }

    try {
      const response = await axios.get(source.url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'HorseRacingPlatform/1.0 (News Aggregator)',
        },
      });

      const $ = cheerio.load(response.data);
      const articles: NewsArticle[] = [];

      $(source.selectors.article).each((_, element) => {
        try {
          const $article = $(element);
          
          const title = $article.find(source.selectors!.title).text().trim();
          const content = $article.find(source.selectors!.content).text().trim();
          const url = $article.find(source.selectors!.url).attr('href');
          
          if (!title || !content || !url) {
            return;
          }

          // Make URL absolute if it's relative
          const absoluteUrl = url.startsWith('http') ? url : new URL(url, source.url).href;

          const author = source.selectors!.author
            ? $article.find(source.selectors!.author).text().trim()
            : undefined;

          const publishedAtText = source.selectors!.publishedAt
            ? $article.find(source.selectors!.publishedAt).text().trim()
            : undefined;

          const publishedAt = publishedAtText ? new Date(publishedAtText) : new Date();

          const article: NewsArticle = {
            sourceId: source.id,
            sourceName: source.name,
            title,
            content: this.cleanContent(content),
            author,
            publishedAt,
            url: absoluteUrl,
            contentHash: this.generateContentHash(title, content),
          };

          articles.push(article);
        } catch (error) {
          logger.warn(
            { sourceId: source.id, error: error instanceof Error ? error.message : 'Unknown error' },
            'Failed to parse article element'
          );
        }
      });

      logger.info(
        { sourceId: source.id, count: articles.length },
        'Successfully scraped web source'
      );

      return articles;
    } catch (error) {
      logger.error(
        { sourceId: source.id, error: error instanceof Error ? error.message : 'Unknown error' },
        'Failed to scrape web source'
      );
      throw error;
    }
  }

  /**
   * Clean and normalize content
   */
  private cleanContent(content: string): string {
    return content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Generate content hash for duplicate detection
   */
  private generateContentHash(title: string, content: string): string {
    const normalized = `${title.toLowerCase().trim()}|${content.toLowerCase().trim()}`;
    return createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Detect duplicates in a list of articles
   */
  detectDuplicates(articles: NewsArticle[]): NewsArticle[] {
    const seen = new Set<string>();
    const unique: NewsArticle[] = [];

    for (const article of articles) {
      if (!article.contentHash) {
        article.contentHash = this.generateContentHash(article.title, article.content);
      }

      if (!seen.has(article.contentHash)) {
        seen.add(article.contentHash);
        unique.push(article);
      }
    }

    const duplicateCount = articles.length - unique.length;
    if (duplicateCount > 0) {
      logger.info({ duplicateCount }, 'Removed duplicate articles');
    }

    return unique;
  }
}
