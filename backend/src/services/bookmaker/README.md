# Bookmaker API Integration Service

This service provides a unified interface for integrating with multiple Australian bookmaker APIs through The Odds API.

## Overview

The bookmaker integration service uses **The Odds API** as a single source to fetch odds from multiple Australian bookmakers including:

- TAB
- Sportsbet
- Ladbrokes
- Neds
- Unibet
- Betfair Exchange
- BlueBet
- PointsBet
- Betr

## Architecture

### Components

1. **BaseBookmakerClient** - Abstract base class providing common functionality
   - Authentication handling (API Key, OAuth, Basic Auth)
   - Rate limiting with Bottleneck
   - Request/response interceptors
   - Error handling

2. **OddsApiClient** - The Odds API implementation
   - Fetches odds from multiple bookmakers
   - Normalizes data to consistent format
   - Handles Australian horse racing specifically

3. **CircuitBreaker** - Fault tolerance pattern
   - Prevents cascading failures
   - Three states: CLOSED, OPEN, HALF_OPEN
   - Automatic recovery

4. **BookmakerManager** - Centralized client management
   - Registers and manages multiple clients
   - Circuit breaker protection
   - Health monitoring
   - Aggregates results from multiple sources

5. **OddsNormalizer** - Data normalization
   - Converts API responses to consistent format
   - Calculates best odds
   - Detects odds movements
   - Finds arbitrage opportunities

6. **Authentication Handlers**
   - OAuthHandler - OAuth 2.0 flows
   - ApiKeyHandler - API key authentication
   - BasicAuthHandler - HTTP Basic auth
   - TokenManager - Token storage and expiry

## Usage

### Initialize Clients

```typescript
import { initializeBookmakerClients } from './services/bookmaker/init';

// Initialize on server startup
initializeBookmakerClients();
```

### Fetch Odds

```typescript
import { bookmakerManager } from './services/bookmaker';

// Fetch odds from all bookmakers
const request = {
  sport: 'horseracing_au',
  region: 'au',
  markets: ['h2h'],
  oddsFormat: 'decimal',
};

const results = await bookmakerManager.fetchOddsFromAll(request);

// Fetch from specific bookmaker
const oddsApiResult = await bookmakerManager.fetchOddsFromBookmaker('The Odds API', request);
```

### Normalize Odds

```typescript
import { oddsNormalizer } from './services/bookmaker';

// Normalize event odds
const normalizedOdds = oddsNormalizer.normalizeOddsApiEvent(event, raceId);

// Extract best odds
const bestOdds = oddsNormalizer.extractBestOdds(normalizedOdds);

// Calculate odds movement
const movement = oddsNormalizer.calculateOddsMovement(currentOdds, previousOdds);
```

### Monitor Health

```typescript
import { getBookmakerHealth } from './services/bookmaker/init';

// Get health status
const health = getBookmakerHealth();

// Check circuit breaker stats
const stats = bookmakerManager.getCircuitBreakerStats('The Odds API');

// Check rate limit status
const rateLimit = bookmakerManager.getRateLimitStatus('The Odds API');
```

## Configuration

### Environment Variables

```env
# The Odds API
ODDS_API_KEY=your_api_key_here
ODDS_API_BASE_URL=https://api.the-odds-api.com
ODDS_API_SPORT_KEY=horseracing_au
ODDS_API_REGION=au
ODDS_API_RATE_LIMIT=500
```

### Circuit Breaker Configuration

```typescript
const circuitBreakerConfig = {
  failureThreshold: 5, // Open after 5 failures
  successThreshold: 2, // Close after 2 successes
  timeout: 30000, // 30 second timeout
  resetTimeout: 60000, // Try reset after 1 minute
};
```

### Rate Limiting

Rate limiting is handled automatically using Bottleneck:

- Maximum requests per window
- Minimum time between requests
- Automatic queuing

## Error Handling

The service implements comprehensive error handling:

1. **Circuit Breaker** - Stops requests to failing services
2. **Rate Limiting** - Prevents quota exhaustion
3. **Retry Logic** - Automatic retries with backoff
4. **Fallback** - Can fallback to scraping if API fails

### Error Codes

- `BAD_REQUEST` - Invalid request parameters
- `UNAUTHORIZED` - Authentication failed
- `FORBIDDEN` - Access denied
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_SERVER_ERROR` - Server error
- `SERVICE_UNAVAILABLE` - Service temporarily unavailable
- `CIRCUIT_BREAKER_OPEN` - Circuit breaker is open

## Data Flow

```
1. Request odds
   ↓
2. BookmakerManager routes to OddsApiClient
   ↓
3. Circuit Breaker checks if service is healthy
   ↓
4. Rate Limiter queues request if needed
   ↓
5. BaseBookmakerClient adds authentication
   ↓
6. HTTP request to The Odds API
   ↓
7. Response interceptor extracts metadata
   ↓
8. OddsApiClient transforms response
   ↓
9. OddsNormalizer normalizes data
   ↓
10. Return normalized odds
```

## Testing

### Test Connection

```typescript
import { testBookmakerConnections } from './services/bookmaker/init';

await testBookmakerConnections();
```

### Manual Testing

```bash
# Test The Odds API connection
curl "https://api.the-odds-api.com/v4/sports/?apiKey=YOUR_API_KEY"

# Test horse racing odds
curl "https://api.the-odds-api.com/v4/sports/horseracing_au/odds?apiKey=YOUR_API_KEY&regions=au&markets=h2h&oddsFormat=decimal"
```

## Monitoring

### Health Endpoint

The `/health` endpoint includes bookmaker status:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "bookmakers": {
      "The Odds API": {
        "circuitBreaker": {
          "state": "closed",
          "failures": 0,
          "successes": 10
        },
        "rateLimit": {
          "running": 0,
          "queued": 0
        },
        "isActive": true
      }
    }
  }
}
```

### Metrics to Monitor

- Circuit breaker state
- Failure/success counts
- Rate limit usage
- Request queue depth
- Response times
- API quota usage

## Best Practices

1. **Cache Aggressively** - Use Redis to minimize API calls
2. **Monitor Quota** - Track usage via response headers
3. **Handle Failures** - Implement fallback strategies
4. **Batch Requests** - Fetch multiple races when possible
5. **Filter Bookmakers** - Only request needed bookmakers
6. **Adjust Polling** - Vary frequency based on race timing
7. **Log Errors** - Track failures for debugging
8. **Test Regularly** - Verify connections periodically

## Future Enhancements

- Direct bookmaker API integrations (when available)
- Web scraping fallback for redundancy
- Historical odds data storage
- Odds prediction models
- Real-time WebSocket updates
- Multi-region support

## References

- [The Odds API Documentation](https://the-odds-api.com/liveapi/guides/v4/)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
