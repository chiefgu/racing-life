/**
 * Entity extraction service for identifying horses, jockeys, trainers, and meetings in news articles
 */

import logger from '../../config/logger';
import type { NewsArticle, EntityMentions, NewsArticleEntity } from '../../types/news.types';

export class EntityExtractorService {
  // Common Australian racing meeting locations
  private readonly MEETING_PATTERNS = [
    'Flemington',
    'Randwick',
    'Caulfield',
    'Rosehill',
    'Moonee Valley',
    'Doomben',
    'Eagle Farm',
    'Morphettville',
    'Ascot',
    'Belmont',
    'Canterbury',
    'Warwick Farm',
    'Sandown',
    'The Valley',
    'Melbourne Cup',
    'Cox Plate',
    'Golden Slipper',
    'Caulfield Cup',
    'Derby Day',
    'Oaks Day',
    'Stakes Day',
  ];

  // Common jockey/trainer title patterns
  private readonly JOCKEY_PATTERNS = [
    /jockey\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/gi,
    /rider\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/gi,
    /ridden\s+by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/gi,
    /piloted\s+by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/gi,
  ];

  private readonly TRAINER_PATTERNS = [
    /trainer\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/gi,
    /trained\s+by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/gi,
    /conditioned\s+by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/gi,
  ];

  // Horse name patterns - typically capitalized words, sometimes with apostrophes
  private readonly HORSE_PATTERNS = [
    /\b([A-Z][a-z]+(?:'[a-z]+)?(?:\s+[A-Z][a-z]+(?:'[a-z]+)?){0,2})\s+(?:won|finished|ran|placed|started)/gi,
    /\b(?:horse|gelding|mare|colt|filly)\s+([A-Z][a-z]+(?:'[a-z]+)?(?:\s+[A-Z][a-z]+(?:'[a-z]+)?){0,2})/gi,
  ];

  /**
   * Extract entities from a news article
   */
  extractEntities(article: NewsArticle): EntityMentions {
    const text = `${article.title} ${article.content}`;

    const entities: EntityMentions = {
      horses: this.extractHorses(text),
      jockeys: this.extractJockeys(text),
      trainers: this.extractTrainers(text),
      meetings: this.extractMeetings(text),
    };

    logger.debug(
      {
        articleId: article.id,
        horses: entities.horses.length,
        jockeys: entities.jockeys.length,
        trainers: entities.trainers.length,
        meetings: entities.meetings.length,
      },
      'Extracted entities from article'
    );

    return entities;
  }

  /**
   * Extract horse names from text
   */
  private extractHorses(text: string): string[] {
    const horses = new Set<string>();

    for (const pattern of this.HORSE_PATTERNS) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        if (match[1]) {
          const horseName = this.cleanEntityName(match[1]);
          if (this.isValidHorseName(horseName)) {
            horses.add(horseName);
          }
        }
      }
    }

    return Array.from(horses);
  }

  /**
   * Extract jockey names from text
   */
  private extractJockeys(text: string): string[] {
    const jockeys = new Set<string>();

    for (const pattern of this.JOCKEY_PATTERNS) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        if (match[1]) {
          const jockeyName = this.cleanEntityName(match[1]);
          if (this.isValidPersonName(jockeyName)) {
            jockeys.add(jockeyName);
          }
        }
      }
    }

    return Array.from(jockeys);
  }

  /**
   * Extract trainer names from text
   */
  private extractTrainers(text: string): string[] {
    const trainers = new Set<string>();

    for (const pattern of this.TRAINER_PATTERNS) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        if (match[1]) {
          const trainerName = this.cleanEntityName(match[1]);
          if (this.isValidPersonName(trainerName)) {
            trainers.add(trainerName);
          }
        }
      }
    }

    return Array.from(trainers);
  }

  /**
   * Extract meeting locations from text
   */
  private extractMeetings(text: string): string[] {
    const meetings = new Set<string>();

    for (const meeting of this.MEETING_PATTERNS) {
      const regex = new RegExp(`\\b${meeting}\\b`, 'gi');
      if (regex.test(text)) {
        meetings.add(meeting);
      }
    }

    return Array.from(meetings);
  }

  /**
   * Clean and normalize entity name
   */
  private cleanEntityName(name: string): string {
    return name
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s'-]/g, '');
  }

  /**
   * Validate horse name
   */
  private isValidHorseName(name: string): boolean {
    // Must be 2-30 characters
    if (name.length < 2 || name.length > 30) {
      return false;
    }

    // Filter out common false positives
    const blacklist = [
      'The Race',
      'The Horse',
      'The Winner',
      'The Field',
      'The Favourite',
      'The Favorite',
      'Last Year',
      'This Year',
      'Next Year',
    ];

    return !blacklist.some((item) => item.toLowerCase() === name.toLowerCase());
  }

  /**
   * Validate person name (jockey/trainer)
   */
  private isValidPersonName(name: string): boolean {
    // Must have at least first and last name
    const parts = name.split(' ');
    if (parts.length < 2) {
      return false;
    }

    // Each part must be at least 2 characters
    if (parts.some((part) => part.length < 2)) {
      return false;
    }

    return true;
  }

  /**
   * Convert entity mentions to database entities
   */
  convertToArticleEntities(
    articleId: string,
    entities: EntityMentions
  ): NewsArticleEntity[] {
    const articleEntities: NewsArticleEntity[] = [];

    for (const horse of entities.horses) {
      articleEntities.push({
        articleId,
        entityType: 'horse',
        entityName: horse,
      });
    }

    for (const jockey of entities.jockeys) {
      articleEntities.push({
        articleId,
        entityType: 'jockey',
        entityName: jockey,
      });
    }

    for (const trainer of entities.trainers) {
      articleEntities.push({
        articleId,
        entityType: 'trainer',
        entityName: trainer,
      });
    }

    for (const meeting of entities.meetings) {
      articleEntities.push({
        articleId,
        entityType: 'meeting',
        entityName: meeting,
      });
    }

    return articleEntities;
  }

  /**
   * Extract entities and store them for an article
   */
  async extractAndStore(
    article: NewsArticle,
    storageService: any
  ): Promise<EntityMentions> {
    const entities = this.extractEntities(article);

    if (article.id) {
      const articleEntities = this.convertToArticleEntities(article.id, entities);
      await storageService.storeArticleEntities(article.id, articleEntities);
    }

    return entities;
  }
}
