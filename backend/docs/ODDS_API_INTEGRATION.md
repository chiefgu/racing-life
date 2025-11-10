# The Odds API Integration Guide

## Overview

This document outlines the integration with [The Odds API](https://the-odds-api.com/) for fetching Australian horse racing odds from multiple bookmakers.

## API Information

- **Base URL**: `https://api.the-odds-api.com`
- **Version**: v4
- **Authentication**: API Key (query parameter)
- **Documentation**: https://the-odds-api.com/liveapi/guides/v4/

## Horse Racing Support

The Odds API supports horse racing through the following sport keys:

- `horseracing_au` - Australian Horse Racing

## Key Endpoints

### 1. GET /v4/sports

Returns list of available sports (including horse racing).

**Endpoint**: `/v4/sports/?apiKey={apiKey}`

**Parameters**:

- `apiKey` (required) - Your API key
- `all` (optional) - Set to `true` to include out-of-season sports

**Response**:

```json
[
  {
    "key": "horseracing_au",
    "group": "Horse Racing",
    "title": "Horse Racing - Australia",
    "description": "Australian Horse Racing",
    "active": true,
    "has_outrights": false
  }
]
```

### 2. GET /v4/sports/{sport}/odds

Returns upcoming events and odds for a specific sport.

**Endpoint**: `/v4/sports/horseracing_au/odds`

**Parameters**:

- `apiKey` (required) - Your API key
- `regions` (required) - Comma-separated list of regions (e.g., `au` for Australia)
- `markets` (optional) - Comma-separated list of markets (default: `h2h`)
  - `h2h` - Head to head (win odds)
  - `spreads` - Point spreads
  - `totals` - Over/under totals
- `oddsFormat` (optional) - Format for odds display
  - `decimal` (default) - Decimal odds (e.g., 2.50)
  - `american` - American odds (e.g., +150, -200)
- `dateFormat` (optional) - Format for dates
  - `iso` (default) - ISO 8601 format
  - `unix` - Unix timestamp
- `bookmakers` (optional) - Comma-separated list of bookmaker keys to filter

**Example Request**:

```
GET /v4/sports/horseracing_au/odds?apiKey=YOUR_API_KEY&regions=au&markets=h2h&oddsFormat=decimal
```

**Response**:

```json
[
  {
    "id": "abc123def456",
    "sport_key": "horseracing_au",
    "sport_title": "Horse Racing - Australia",
    "commence_time": "2024-01-15T05:30:00Z",
    "home_team": "Flemington Race 5",
    "away_team": null,
    "bookmakers": [
      {
        "key": "sportsbet",
        "title": "Sportsbet",
        "last_update": "2024-01-15T05:15:00Z",
        "markets": [
          {
            "key": "h2h",
            "last_update": "2024-01-15T05:15:00Z",
            "outcomes": [
              {
                "name": "Horse Name 1",
                "price": 3.5
              },
              {
                "name": "Horse Name 2",
                "price": 5.0
              },
              {
                "name": "Horse Name 3",
                "price": 7.5
              }
            ]
          }
        ]
      },
      {
        "key": "tab",
        "title": "TAB",
        "last_update": "2024-01-15T05:14:30Z",
        "markets": [
          {
            "key": "h2h",
            "last_update": "2024-01-15T05:14:30Z",
            "outcomes": [
              {
                "name": "Horse Name 1",
                "price": 3.4
              },
              {
                "name": "Horse Name 2",
                "price": 5.2
              },
              {
                "name": "Horse Name 3",
                "price": 7.0
              }
            ]
          }
        ]
      }
    ]
  }
]
```

### 3. GET /v4/sports/{sport}/events

Returns upcoming events without odds (lighter weight).

**Endpoint**: `/v4/sports/horseracing_au/events`

**Parameters**:

- `apiKey` (required) - Your API key
- `dateFormat` (optional) - `iso` or `unix`
- `commenceTimeFrom` (optional) - Filter events starting from this time
- `commenceTimeTo` (optional) - Filter events up to this time

### 4. GET /v4/sports/{sport}/events/{eventId}/odds

Returns odds for a specific event.

**Endpoint**: `/v4/sports/horseracing_au/events/{eventId}/odds`

**Parameters**: Same as GET odds endpoint

## Australian Bookmakers

Common Australian bookmakers available through The Odds API:

- `sportsbet` - Sportsbet
- `tab` - TAB
- `ladbrokes_au` - Ladbrokes Australia
- `neds` - Neds
- `unibet` - Unibet
- `betfair_ex_au` - Betfair Exchange Australia
- `bluebet` - BlueBet
- `pointsbetau` - PointsBet Australia
- `betr_au` - Betr

## Rate Limiting

- The API implements rate limiting
- Status code `429` indicates rate limit exceeded
- Response headers include:
  - `x-requests-remaining` - Remaining requests in current period
  - `x-requests-used` - Requests used in current period

## Usage Quota

- Each API call consumes quota based on the endpoint
- GET sports: Does not count against quota
- GET odds: Counts against quota (varies by number of events returned)
- Monitor usage via response headers

## Implementation Strategy

### 1. Polling Frequency

For horse racing odds:

- **Pre-race (>30 min)**: Poll every 5-10 minutes
- **Near race time (<30 min)**: Poll every 1-2 minutes
- **Live racing**: Poll every 30-60 seconds

### 2. Data Storage

Store odds snapshots in TimescaleDB hypertable:

```sql
INSERT INTO odds_snapshots (
  race_id,
  horse_id,
  bookmaker_id,
  market,
  win_odds,
  timestamp,
  source_type
) VALUES (
  $1, $2, $3, 'AU', $4, NOW(), 'api'
);
```

### 3. Caching Strategy

Use Redis to cache:

- Recent odds (TTL: 2 minutes)
- Race information (TTL: 5 minutes)
- Bookmaker list (TTL: 1 hour)

### 4. Error Handling

```typescript
try {
  const response = await fetch(oddsApiUrl);

  if (response.status === 429) {
    // Rate limited - back off
    await delay(60000); // Wait 1 minute
    return;
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  // Process data
} catch (error) {
  console.error('Odds API error:', error);
  // Fallback to cached data or scraping
}
```

## Environment Variables

Add to `.env`:

```env
# The Odds API Configuration
ODDS_API_KEY=your_api_key_here
ODDS_API_BASE_URL=https://api.the-odds-api.com
ODDS_API_SPORT_KEY=horseracing_au
ODDS_API_REGION=au
ODDS_API_POLL_INTERVAL=120000
```

## Cost Optimization

1. **Filter by bookmakers**: Only request odds from bookmakers you display
2. **Use event endpoint first**: Get event list, then fetch odds only for relevant races
3. **Cache aggressively**: Use Redis to minimize API calls
4. **Batch requests**: Fetch multiple races in single request when possible
5. **Monitor quota**: Track usage via response headers and adjust polling frequency

## Integration Checklist

- [ ] Sign up for The Odds API account
- [ ] Get API key and add to environment variables
- [ ] Implement odds fetching service
- [ ] Set up polling scheduler
- [ ] Configure rate limiting and backoff
- [ ] Implement caching layer
- [ ] Store odds snapshots in TimescaleDB
- [ ] Add error handling and fallbacks
- [ ] Monitor API usage and costs
- [ ] Set up alerts for quota limits

## Testing

### Test API Connection

```bash
curl "https://api.the-odds-api.com/v4/sports/?apiKey=YOUR_API_KEY"
```

### Test Horse Racing Odds

```bash
curl "https://api.the-odds-api.com/v4/sports/horseracing_au/odds?apiKey=YOUR_API_KEY&regions=au&markets=h2h&oddsFormat=decimal"
```

## Additional Resources

- [The Odds API Documentation](https://the-odds-api.com/liveapi/guides/v4/)
- [Swagger API Docs](https://app.swaggerhub.com/apis-docs/the-odds-api/odds-api/4)
- [Account Dashboard](https://dash.the-odds-api.com/)
- [Pricing Plans](https://the-odds-api.com/#get-access)

## Notes

- The Odds API provides real-time odds from multiple bookmakers
- Data is aggregated from official bookmaker APIs and websites
- Odds are updated frequently (typically every 1-5 minutes)
- Historical odds data may be available depending on subscription tier
- Consider implementing a fallback scraping solution for redundancy
