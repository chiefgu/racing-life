# Odds Collection and Processing System

This module implements a comprehensive odds collection and processing pipeline for the horse racing platform.

## Overview

The system consists of four main components:

1. **Odds Processor** - Normalizes odds data and matches to database entities
2. **Odds Validator** - Validates odds values and detects anomalies
3. **Odds Collection Jobs** - Manages scheduled collection using Bull queue
4. **Odds Storage** - Stores odds snapshots in TimescaleDB

## Architecture

```
┌─────────────────┐
│  Bookmaker APIs │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Odds Normalizer │ (from bookmaker service)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Odds Processor  │ ◄── Matches races/horses/bookmakers
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Odds Validator  │ ◄── Validates & detects anomalies
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Odds Storage    │ ◄── Stores in TimescaleDB
└─────────────────┘
```

## Components

### 1. Odds Processor Service

Handles odds normalization and entity matching.

**Key Features:**

- Race matching by ID or attributes
- Horse matching within races (exact and fuzzy)
- Bookmaker matching by slug or name
- Duplicate detection within time windows
- Batch processing support

**Usage:**

```typescript
import { oddsProcessorService } from './odds-processor.service';

// Process normalized odds
const processedOdds = await oddsProcessorService.processOdds(normalizedOdds);

// Detect duplicates
const uniqueOdds = await oddsProcessorService.detectDuplicates(processedOdds);
```

### 2. Odds Validator Service

Validates odds values and detects anomalous changes.

**Key Features:**

- Odds value validation (>= 1.01)
- Implied probability sum checking
- Anomalous change detection (>20% threshold)
- Batch validation support
- Severity classification (low/medium/high)

**Usage:**

```typescript
import { oddsValidatorService } from './odds-validator.service';

// Validate single odds entry
const validation = oddsValidatorService.validateOdds(odds);

// Detect anomalies
const anomaly = await oddsValidatorService.detectAnomalousChanges(odds);

// Batch validate
const results = await oddsValidatorService.batchValidate(oddsArray);
```

### 3. Odds Collection Job Service

Manages scheduled odds collection using Bull queue.

**Key Features:**

- Periodic collection scheduling (default: 60 seconds)
- Job retry logic with exponential backoff
- Queue monitoring and statistics
- Job pause/resume functionality
- Failed job retry

**Usage:**

```typescript
import { oddsCollectionJobService } from './odds-collection-job.service';

// Schedule periodic collection
await oddsCollectionJobService.schedulePeriodicCollection(
  {
    sport: 'horse_racing_australia',
    region: 'au',
    markets: ['h2h', 'win', 'place'],
  },
  60
);

// Add one-time job
await oddsCollectionJobService.addOddsCollectionJob({
  sport: 'horse_racing_australia',
  region: 'au',
  raceIds: ['race-123'],
});

// Get queue stats
const stats = await oddsCollectionJobService.getQueueStats();
```

### 4. Odds Storage Service

Stores odds snapshots in TimescaleDB with retention policies.

**Key Features:**

- Batch insert support (chunks of 1000)
- Historical odds queries
- Odds movement analysis
- Best odds aggregation
- Odds velocity calculation
- Continuous aggregates for hourly averages

**Usage:**

```typescript
import { oddsStorageService } from './odds-storage.service';

// Store odds snapshots
await oddsStorageService.storeOddsSnapshots(processedOdds);

// Get latest odds for race
const latestOdds = await oddsStorageService.getLatestOddsForRace(raceId);

// Get odds history
const history = await oddsStorageService.getOddsHistory(raceId, horseId, startTime, endTime);

// Get odds movement summary
const summary = await oddsStorageService.getOddsMovementSummary(raceId, horseId, bookmakerId);
```

## Orchestrator

The `OddsCollectionOrchestrator` provides high-level workflow management:

```typescript
import { oddsCollectionOrchestrator } from './odds-collection-orchestrator';

// Initialize periodic collection
await oddsCollectionOrchestrator.initializeHorseRacingCollection();

// Collect odds for specific races
await oddsCollectionOrchestrator.collectOddsForRaces(['race-1', 'race-2']);

// Get status
const status = await oddsCollectionOrchestrator.getCollectionStatus();

// Stop/resume collection
await oddsCollectionOrchestrator.stopAllCollection();
await oddsCollectionOrchestrator.resumeCollection();
```

## Data Flow

1. **Collection**: Bull queue triggers odds collection job
2. **Fetching**: Bookmaker manager fetches odds from APIs
3. **Normalization**: Odds normalizer converts to standard format
4. **Processing**: Odds processor matches to database entities
5. **Validation**: Odds validator checks values and detects anomalies
6. **Deduplication**: Processor removes duplicates
7. **Storage**: Odds storage saves to TimescaleDB

## Database Schema

### odds_snapshots (TimescaleDB Hypertable)

```sql
CREATE TABLE odds_snapshots (
  id UUID DEFAULT gen_random_uuid(),
  race_id UUID NOT NULL,
  horse_id UUID NOT NULL,
  bookmaker_id UUID NOT NULL,
  market VARCHAR(20) DEFAULT 'AU',
  win_odds DECIMAL(10,2) NOT NULL CHECK (win_odds >= 1.01),
  place_odds DECIMAL(10,2),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  source_type VARCHAR(20) DEFAULT 'api',
  PRIMARY KEY (id, timestamp)
);

-- Partitioned by timestamp
SELECT create_hypertable('odds_snapshots', 'timestamp');

-- Retention policy: 90 days
SELECT add_retention_policy('odds_snapshots', INTERVAL '90 days');
```

### Indexes

- `idx_odds_race_time`: (race_id, timestamp DESC)
- `idx_odds_horse_time`: (horse_id, timestamp DESC)
- `idx_odds_bookmaker_time`: (bookmaker_id, timestamp DESC)

## Configuration

### Environment Variables

```env
# Redis connection for Bull queue
REDIS_URL=redis://localhost:6379

# Database connection
DATABASE_URL=postgresql://user:pass@localhost:5432/racing_db
```

### Job Configuration

Default job options:

- **Attempts**: 3
- **Backoff**: Exponential, 5s initial delay
- **Remove on complete**: Keep last 100
- **Remove on fail**: Keep last 50

## Monitoring

### Queue Statistics

```typescript
const stats = await oddsCollectionJobService.getQueueStats();
// {
//   waiting: 5,
//   active: 2,
//   completed: 1234,
//   failed: 12,
//   delayed: 0
// }
```

### Storage Statistics

```typescript
const stats = await oddsStorageService.getStorageStats();
// {
//   totalSnapshots: 1500000,
//   oldestSnapshot: Date,
//   newestSnapshot: Date,
//   uniqueRaces: 5000,
//   uniqueHorses: 25000,
//   uniqueBookmakers: 8
// }
```

## Error Handling

### Validation Errors

```typescript
{
  valid: false,
  errors: [
    {
      code: 'INVALID_WIN_ODDS',
      message: 'Win odds must be between 1.01 and 1000',
      field: 'winOdds',
      value: 0.5
    }
  ],
  warnings: []
}
```

### Anomaly Detection

```typescript
{
  isAnomalous: true,
  anomalyType: 'sudden_drop',
  severity: 'high',
  details: 'Odds decreased by 45.2% from 5.50 to 3.01',
  previousOdds: 5.50,
  currentOdds: 3.01,
  changePercentage: -45.2
}
```

## Performance

### Batch Processing

- Process up to 1000 odds entries per batch
- Batch insert in chunks of 1000 to avoid query limits
- Parallel processing for multiple bookmakers

### Deduplication

- Time window: 60 seconds (configurable)
- Checks recent database entries to avoid duplicates
- In-memory deduplication within batch

### TimescaleDB Optimization

- Automatic partitioning by timestamp
- Continuous aggregates for hourly averages
- Retention policy: 90 days (configurable)
- Optimized indexes for common queries

## Testing

Run tests:

```bash
npm test -- odds
```

## Requirements Mapping

This implementation satisfies the following requirements:

- **1.2**: Periodic odds fetching (every 30-60 seconds) ✓
- **1.3**: Odds normalization and validation ✓
- **1.4**: Store odds with timestamp for historical tracking ✓
- **3.3**: Real-time odds updates ✓
- **6.2**: Graceful handling of source failures ✓
- **6.4**: Odds validation (>= 1.01) ✓
- **7.1**: TimescaleDB for time-series data ✓

## Future Enhancements

- [ ] Real-time WebSocket broadcasting of odds updates
- [ ] Machine learning for anomaly detection
- [ ] Arbitrage opportunity detection
- [ ] Odds prediction models
- [ ] Advanced analytics dashboards
