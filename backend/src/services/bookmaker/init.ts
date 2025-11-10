import { OddsApiClient } from './odds-api-client';
import { bookmakerManager } from './bookmaker-manager';
import { CircuitBreakerConfig } from '../../types/bookmaker.types';

/**
 * Initialize bookmaker clients
 */
export function initializeBookmakerClients(): void {
  const oddsApiKey = process.env.ODDS_API_KEY;

  if (!oddsApiKey) {
    console.warn('ODDS_API_KEY not configured. Bookmaker integration disabled.');
    return;
  }

  // Initialize The Odds API client
  const oddsApiClient = new OddsApiClient(oddsApiKey);

  // Circuit breaker configuration for The Odds API
  const circuitBreakerConfig: CircuitBreakerConfig = {
    failureThreshold: 5, // Open circuit after 5 failures
    successThreshold: 2, // Close circuit after 2 successes in half-open state
    timeout: 30000, // 30 second timeout for requests
    resetTimeout: 60000, // Try to reset after 1 minute
  };

  // Register the client with the manager
  bookmakerManager.registerClient(oddsApiClient, circuitBreakerConfig);

  console.log('Bookmaker clients initialized successfully');
}

/**
 * Test all bookmaker connections
 */
export async function testBookmakerConnections(): Promise<void> {
  console.log('Testing bookmaker connections...');
  
  const results = await bookmakerManager.testAllConnections();
  
  results.forEach((success, name) => {
    if (success) {
      console.log(`✓ ${name}: Connected`);
    } else {
      console.error(`✗ ${name}: Connection failed`);
    }
  });
}

/**
 * Get bookmaker health status
 */
export function getBookmakerHealth() {
  return bookmakerManager.getHealthStatus();
}
