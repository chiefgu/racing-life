/**
 * Bookmaker API Types and Interfaces
 */

export enum AuthType {
  API_KEY = 'api_key',
  OAUTH = 'oauth',
  BASIC = 'basic',
}

export enum BookmakerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

export interface BookmakerConfig {
  id: string;
  name: string;
  slug: string;
  apiEndpoint: string;
  authType: AuthType;
  credentials: BookmakerCredentials;
  rateLimit: RateLimitConfig;
  enabled: boolean;
}

export interface BookmakerCredentials {
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  username?: string;
  password?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  minTime?: number; // Minimum time between requests in ms
}

export interface OddsRequest {
  sport: string;
  region: string;
  markets?: string[];
  oddsFormat?: 'decimal' | 'american';
  dateFormat?: 'iso' | 'unix';
  bookmakers?: string[];
  commenceTimeFrom?: string;
  commenceTimeTo?: string;
}

export interface OddsResponse {
  events: RaceEvent[];
  timestamp: Date;
  source: string;
}

export interface RaceEvent {
  id: string;
  sportKey: string;
  sportTitle: string;
  commenceTime: Date;
  homeTeam: string;
  awayTeam?: string;
  bookmakers: BookmakerOdds[];
}

export interface BookmakerOdds {
  key: string;
  title: string;
  lastUpdate: Date;
  markets: Market[];
}

export interface Market {
  key: string;
  lastUpdate: Date;
  outcomes: Outcome[];
}

export interface Outcome {
  name: string;
  price: number;
  point?: number;
}

export interface NormalizedOdds {
  raceId: string;
  horseId: string;
  horseName: string;
  bookmaker: string;
  winOdds: number;
  placeOdds?: number;
  market: string;
  timestamp: Date;
  sourceType: 'api' | 'scraper';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode?: number;
  details?: any;
}

export interface ResponseMetadata {
  requestsRemaining?: number;
  requestsUsed?: number;
  quotaUsed?: number;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: Date;
  };
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  resetTimeout: number;
}

export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime?: Date;
  nextAttemptTime?: Date;
}
