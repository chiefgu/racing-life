// Core types for the horse racing platform

export interface Race {
  id: string;
  meetingLocation: string;
  meetingDate: string;
  raceNumber: number;
  raceName: string;
  distance: number;
  trackCondition: string;
  startTime: string;
  status: 'upcoming' | 'live' | 'resulted';
}

export interface Horse {
  id: string;
  name: string;
  age: number;
  sex: string;
  trainer: string;
  jockey: string;
  form: string;
  weight: number;
  number: number;
}

export interface Selection {
  horseName: string;
  horseNumber: number;
  bookmaker: string;
  winOdds: number;
  placeOdds?: number;
  lastUpdated: string;
}

export interface OddsSnapshot {
  id: string;
  raceId: string;
  horseId: string;
  bookmaker: string;
  market: 'AU';
  winOdds: number;
  placeOdds?: number;
  timestamp: string;
}

export interface Bookmaker {
  id: string;
  name: string;
  slug: string;
  logo: string;
  affiliateLink: string;
  features: string[];
  rating: number;
  currentPromotions: Promotion[];
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  validUntil: string;
}

export interface NewsArticle {
  id: string;
  sourceId: string;
  title: string;
  content: string;
  author?: string;
  publishedAt: string;
  url: string;
  entities: EntityMentions;
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
  confidence: number;
  entitySentiments: EntitySentiment[];
}

export interface EntitySentiment {
  entityName: string;
  entityType: 'horse' | 'jockey' | 'trainer';
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  relevantQuotes: string[];
}

export interface Ambassador {
  id: string;
  name: string;
  slug: string;
  bio: string;
  profileImage: string;
  socialLinks: SocialLinks;
  status: 'pending' | 'active' | 'suspended';
  joinedAt: string;
}

export interface SocialLinks {
  twitter?: string;
  instagram?: string;
  facebook?: string;
}

export interface Article {
  id: string;
  ambassadorId: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  status: 'draft' | 'pending' | 'published';
  publishedAt?: string;
  tags: string[];
  relatedRaces: string[];
  views: number;
  clicks: number;
}

export interface RaceFilters {
  meetingLocation?: string;
  date?: string;
  status?: Race['status'];
  search?: string;
}

export interface NewsFilters {
  entity?: string;
  entityType?: 'horse' | 'jockey' | 'trainer';
  sentiment?: 'positive' | 'negative' | 'neutral';
  dateFrom?: string;
  dateTo?: string;
}

export interface WatchlistItem {
  id: string;
  name: string;
  createdAt: string;
}

export interface Watchlist {
  horse?: WatchlistItem[];
  jockey?: WatchlistItem[];
  trainer?: WatchlistItem[];
  meeting?: WatchlistItem[];
}

export interface UserPreferences {
  notifications_news: boolean;
  notifications_watchlist: boolean;
  email_digest_enabled: boolean;
  email_digest_time: string;
}
