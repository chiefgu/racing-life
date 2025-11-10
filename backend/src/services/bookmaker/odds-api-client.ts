import { BaseBookmakerClient } from './base-client';
import {
  BookmakerConfig,
  OddsRequest,
  OddsResponse,
  ApiResponse,
  RaceEvent,
  BookmakerOdds,
  Market,
  Outcome,
  AuthType,
} from '../../types/bookmaker.types';

/**
 * The Odds API Client
 * Integrates with The Odds API to fetch odds from multiple Australian bookmakers
 * including TAB, Sportsbet, Ladbrokes, Neds, Bet365, and others
 */
export class OddsApiClient extends BaseBookmakerClient {
  private readonly SPORT_KEY = 'horseracing_au';
  private readonly REGION = 'au';

  constructor(apiKey: string) {
    const config: BookmakerConfig = {
      id: 'odds-api',
      name: 'The Odds API',
      slug: 'odds-api',
      apiEndpoint: process.env.ODDS_API_BASE_URL || 'https://api.the-odds-api.com',
      authType: AuthType.API_KEY,
      credentials: {
        apiKey,
      },
      rateLimit: {
        maxRequests: parseInt(process.env.ODDS_API_RATE_LIMIT || '500'),
        windowMs: 60000, // 1 minute
        minTime: 100, // Minimum 100ms between requests
      },
      enabled: true,
    };

    super(config);
  }

  /**
   * Fetch odds from The Odds API
   */
  async fetchOdds(request: OddsRequest): Promise<ApiResponse<OddsResponse>> {
    const params: Record<string, string> = {
      regions: request.region || this.REGION,
      oddsFormat: request.oddsFormat || 'decimal',
      dateFormat: request.dateFormat || 'iso',
    };

    // Add optional parameters
    if (request.markets && request.markets.length > 0) {
      params.markets = request.markets.join(',');
    }

    if (request.bookmakers && request.bookmakers.length > 0) {
      params.bookmakers = request.bookmakers.join(',');
    }

    if (request.commenceTimeFrom) {
      params.commenceTimeFrom = request.commenceTimeFrom;
    }

    if (request.commenceTimeTo) {
      params.commenceTimeTo = request.commenceTimeTo;
    }

    const sportKey = request.sport || this.SPORT_KEY;
    const response = await this.makeRequest<any[]>(
      'GET',
      `/v4/sports/${sportKey}/odds`,
      { params }
    );

    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.error,
        metadata: response.metadata,
      };
    }

    // Transform response to our format
    const oddsResponse: OddsResponse = {
      events: this.transformEvents(response.data),
      timestamp: new Date(),
      source: 'odds-api',
    };

    return {
      success: true,
      data: oddsResponse,
      metadata: response.metadata,
    };
  }

  /**
   * Fetch odds for a specific event
   */
  async fetchEventOdds(
    eventId: string,
    request: Partial<OddsRequest> = {}
  ): Promise<ApiResponse<RaceEvent>> {
    const params: Record<string, string> = {
      regions: request.region || this.REGION,
      oddsFormat: request.oddsFormat || 'decimal',
      dateFormat: request.dateFormat || 'iso',
    };

    if (request.markets && request.markets.length > 0) {
      params.markets = request.markets.join(',');
    }

    if (request.bookmakers && request.bookmakers.length > 0) {
      params.bookmakers = request.bookmakers.join(',');
    }

    const sportKey = request.sport || this.SPORT_KEY;
    const response = await this.makeRequest<any>(
      'GET',
      `/v4/sports/${sportKey}/events/${eventId}/odds`,
      { params }
    );

    if (!response.success || !response.data) {
      return response as ApiResponse<RaceEvent>;
    }

    return {
      success: true,
      data: this.transformEvent(response.data),
      metadata: response.metadata,
    };
  }

  /**
   * Fetch upcoming events without odds (lighter weight)
   */
  async fetchEvents(
    request: Partial<OddsRequest> = {}
  ): Promise<ApiResponse<RaceEvent[]>> {
    const params: Record<string, string> = {
      dateFormat: request.dateFormat || 'iso',
    };

    if (request.commenceTimeFrom) {
      params.commenceTimeFrom = request.commenceTimeFrom;
    }

    if (request.commenceTimeTo) {
      params.commenceTimeTo = request.commenceTimeTo;
    }

    const sportKey = request.sport || this.SPORT_KEY;
    const response = await this.makeRequest<any[]>(
      'GET',
      `/v4/sports/${sportKey}/events`,
      { params }
    );

    if (!response.success || !response.data) {
      return response as ApiResponse<RaceEvent[]>;
    }

    return {
      success: true,
      data: response.data.map((event: any) => this.transformEvent(event)),
      metadata: response.metadata,
    };
  }

  /**
   * Get list of available sports
   */
  async getSports(): Promise<ApiResponse<any[]>> {
    const response = await this.makeRequest<any[]>('GET', '/v4/sports', {
      params: { all: 'false' },
    });

    return response;
  }

  /**
   * Test connection to The Odds API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.getSports();
      return response.success;
    } catch (error) {
      console.error('The Odds API connection test failed:', error);
      return false;
    }
  }

  /**
   * Get client name
   */
  getName(): string {
    return 'The Odds API';
  }

  /**
   * Transform API events to our format
   */
  private transformEvents(events: any[]): RaceEvent[] {
    return events.map((event) => this.transformEvent(event));
  }

  /**
   * Transform single event to our format
   */
  private transformEvent(event: any): RaceEvent {
    return {
      id: event.id,
      sportKey: event.sport_key,
      sportTitle: event.sport_title,
      commenceTime: new Date(event.commence_time),
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      bookmakers: event.bookmakers
        ? event.bookmakers.map((bm: any) => this.transformBookmaker(bm))
        : [],
    };
  }

  /**
   * Transform bookmaker data to our format
   */
  private transformBookmaker(bookmaker: any): BookmakerOdds {
    return {
      key: bookmaker.key,
      title: bookmaker.title,
      lastUpdate: new Date(bookmaker.last_update),
      markets: bookmaker.markets
        ? bookmaker.markets.map((market: any) => this.transformMarket(market))
        : [],
    };
  }

  /**
   * Transform market data to our format
   */
  private transformMarket(market: any): Market {
    return {
      key: market.key,
      lastUpdate: new Date(market.last_update),
      outcomes: market.outcomes
        ? market.outcomes.map((outcome: any) => this.transformOutcome(outcome))
        : [],
    };
  }

  /**
   * Transform outcome data to our format
   */
  private transformOutcome(outcome: any): Outcome {
    return {
      name: outcome.name,
      price: outcome.price,
      point: outcome.point,
    };
  }

  /**
   * Get available Australian bookmakers
   */
  getAustralianBookmakers(): string[] {
    return [
      'tab',
      'sportsbet',
      'ladbrokes_au',
      'neds',
      'unibet',
      'betfair_ex_au',
      'bluebet',
      'pointsbetau',
      'betr_au',
    ];
  }

  /**
   * Fetch odds from specific Australian bookmakers
   */
  async fetchAustralianOdds(
    bookmakers?: string[]
  ): Promise<ApiResponse<OddsResponse>> {
    const request: OddsRequest = {
      sport: this.SPORT_KEY,
      region: this.REGION,
      markets: ['h2h'], // Win odds
      oddsFormat: 'decimal',
      bookmakers: bookmakers || this.getAustralianBookmakers(),
    };

    return this.fetchOdds(request);
  }
}
