import { BaseBookmakerClient } from './base-client';
import { CircuitBreaker } from './circuit-breaker';
import {
  OddsRequest,
  OddsResponse,
  ApiResponse,
  CircuitBreakerConfig,
} from '../../types/bookmaker.types';

/**
 * Bookmaker Manager
 * Manages multiple bookmaker API clients with circuit breaker protection
 */
export class BookmakerManager {
  private clients: Map<string, BaseBookmakerClient> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private defaultCircuitBreakerConfig: CircuitBreakerConfig = {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 30000,
    resetTimeout: 60000,
  };

  /**
   * Register a bookmaker client
   */
  public registerClient(
    client: BaseBookmakerClient,
    circuitBreakerConfig?: CircuitBreakerConfig
  ): void {
    const name = client.getName();
    this.clients.set(name, client);

    const config = circuitBreakerConfig || this.defaultCircuitBreakerConfig;
    this.circuitBreakers.set(name, new CircuitBreaker(config));

    console.log(`Registered bookmaker client: ${name}`);
  }

  /**
   * Unregister a bookmaker client
   */
  public unregisterClient(name: string): void {
    this.clients.delete(name);
    this.circuitBreakers.delete(name);
    console.log(`Unregistered bookmaker client: ${name}`);
  }

  /**
   * Get a specific bookmaker client
   */
  public getClient(name: string): BaseBookmakerClient | undefined {
    return this.clients.get(name);
  }

  /**
   * Get all registered clients
   */
  public getAllClients(): BaseBookmakerClient[] {
    return Array.from(this.clients.values());
  }

  /**
   * Get all active clients (circuit not open)
   */
  public getActiveClients(): BaseBookmakerClient[] {
    return Array.from(this.clients.entries())
      .filter(([name]) => {
        const breaker = this.circuitBreakers.get(name);
        return breaker && !breaker.isOpen();
      })
      .map(([_, client]) => client);
  }

  /**
   * Fetch odds from a specific bookmaker with circuit breaker protection
   */
  public async fetchOddsFromBookmaker(
    bookmakerName: string,
    request: OddsRequest
  ): Promise<ApiResponse<OddsResponse>> {
    const client = this.clients.get(bookmakerName);
    const breaker = this.circuitBreakers.get(bookmakerName);

    if (!client) {
      return {
        success: false,
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: `Bookmaker client '${bookmakerName}' not found`,
        },
      };
    }

    if (!breaker) {
      return {
        success: false,
        error: {
          code: 'CIRCUIT_BREAKER_NOT_FOUND',
          message: `Circuit breaker for '${bookmakerName}' not found`,
        },
      };
    }

    try {
      const result = await breaker.execute(() => client.fetchOdds(request));
      return result;
    } catch (error: any) {
      console.error(`Error fetching odds from ${bookmakerName}:`, error);
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error.message || 'Failed to fetch odds',
          details: error,
        },
      };
    }
  }

  /**
   * Fetch odds from all active bookmakers
   */
  public async fetchOddsFromAll(
    request: OddsRequest
  ): Promise<Map<string, ApiResponse<OddsResponse>>> {
    const results = new Map<string, ApiResponse<OddsResponse>>();
    const activeClients = this.getActiveClients();

    const promises = activeClients.map(async (client) => {
      const name = client.getName();
      const result = await this.fetchOddsFromBookmaker(name, request);
      results.set(name, result);
    });

    await Promise.allSettled(promises);
    return results;
  }

  /**
   * Fetch odds from all bookmakers and aggregate results
   */
  public async fetchAndAggregateOdds(
    request: OddsRequest
  ): Promise<OddsResponse[]> {
    const results = await this.fetchOddsFromAll(request);
    const successfulResults: OddsResponse[] = [];

    results.forEach((result, bookmaker) => {
      if (result.success && result.data) {
        successfulResults.push(result.data);
      } else {
        console.warn(`Failed to fetch odds from ${bookmaker}:`, result.error);
      }
    });

    return successfulResults;
  }

  /**
   * Test connection for a specific bookmaker
   */
  public async testBookmakerConnection(
    bookmakerName: string
  ): Promise<boolean> {
    const client = this.clients.get(bookmakerName);
    if (!client) {
      console.error(`Bookmaker client '${bookmakerName}' not found`);
      return false;
    }

    try {
      return await client.testConnection();
    } catch (error) {
      console.error(`Connection test failed for ${bookmakerName}:`, error);
      return false;
    }
  }

  /**
   * Test connections for all bookmakers
   */
  public async testAllConnections(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    const clients = Array.from(this.clients.entries());

    const promises = clients.map(async ([name, _client]) => {
      const success = await this.testBookmakerConnection(name);
      results.set(name, success);
    });

    await Promise.allSettled(promises);
    return results;
  }

  /**
   * Get circuit breaker stats for a bookmaker
   */
  public getCircuitBreakerStats(bookmakerName: string) {
    const breaker = this.circuitBreakers.get(bookmakerName);
    return breaker?.getStats();
  }

  /**
   * Get circuit breaker stats for all bookmakers
   */
  public getAllCircuitBreakerStats() {
    const stats = new Map();
    this.circuitBreakers.forEach((breaker, name) => {
      stats.set(name, breaker.getStats());
    });
    return stats;
  }

  /**
   * Reset circuit breaker for a bookmaker
   */
  public resetCircuitBreaker(bookmakerName: string): void {
    const breaker = this.circuitBreakers.get(bookmakerName);
    if (breaker) {
      breaker.reset();
      console.log(`Circuit breaker reset for ${bookmakerName}`);
    }
  }

  /**
   * Reset all circuit breakers
   */
  public resetAllCircuitBreakers(): void {
    this.circuitBreakers.forEach((breaker, _name) => {
      breaker.reset();
    });
    console.log('All circuit breakers reset');
  }

  /**
   * Get rate limit status for a bookmaker
   */
  public getRateLimitStatus(bookmakerName: string) {
    const client = this.clients.get(bookmakerName);
    return client?.getRateLimitStatus();
  }

  /**
   * Get rate limit status for all bookmakers
   */
  public getAllRateLimitStatus() {
    const status = new Map();
    this.clients.forEach((client, name) => {
      status.set(name, client.getRateLimitStatus());
    });
    return status;
  }

  /**
   * Get health status for all bookmakers
   */
  public getHealthStatus() {
    const health = new Map();

    this.clients.forEach((client, name) => {
      const circuitBreaker = this.circuitBreakers.get(name);
      const rateLimit = client.getRateLimitStatus();

      health.set(name, {
        circuitBreaker: circuitBreaker?.getStats(),
        rateLimit,
        isActive: circuitBreaker ? !circuitBreaker.isOpen() : false,
      });
    });

    return health;
  }
}

// Singleton instance
export const bookmakerManager = new BookmakerManager();
