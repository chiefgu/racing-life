/**
 * News aggregation type definitions
 */

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  type: 'rss' | 'web';
  selectors?: ScraperSelectors;
  pollInterval: number; // minutes
  enabled: boolean;
}

export interface ScraperSelectors {
  article: string;
  title: string;
  content: string;
  author?: string;
  publishedAt?: string;
  url: string;
}

export interface NewsArticle {
  id?: string;
  sourceId: string;
  sourceName: string;
  title: string;
  content: string;
  author?: string;
  publishedAt: Date;
  url: string;
  contentHash?: string;
  entities?: EntityMentions;
  sentiment?: SentimentScore;
  rewrittenContent?: string;
}

export interface EntityMentions {
  horses: string[];
  jockeys: string[];
  trainers: string[];
  meetings: string[];
}

export interface SentimentScore {
  overall: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0-1
  entitySentiments?: EntitySentiment[];
}

export interface EntitySentiment {
  entityName: string;
  entityType: 'horse' | 'jockey' | 'trainer' | 'meeting';
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  relevantQuotes?: string[];
}

export interface NewsArticleEntity {
  id?: string;
  articleId: string;
  entityType: 'horse' | 'jockey' | 'trainer' | 'meeting';
  entityName: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  sentimentConfidence?: number;
}
