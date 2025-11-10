import { db as knex } from '../db/knex';
import { ProcessedOdds } from './odds-processor.service';
import { WebSocketService } from './websocket.service';

/**
 * Odds Storage Service
 * Handles storing odds snapshots in TimescaleDB with retention policies and indexes
 */

export interface OddsSnapshot {
  id?: string;
  raceId: string;
  horseId: string;
  bookmakerId: string;
  market: string;
  winOdds: number;
  placeOdds?: number;
  timestamp: Date;
  sourceType: 'api' | 'scraper';
}

export interface OddsQuery {
  raceId?: string;
  horseId?: string;
  bookmakerId?: string;
  startTime?: Date;
  endTime?: Date;
  limit?: number;
}

export interface OddsHistoryPoint {
  timestamp: Date;
  winOdds: number;
  placeOdds?: number;
  bookmaker: string;
}

export class OddsStorageService {
  /**
   * Store a single odds snapshot
   */
  async storeOddsSnapshot(odds: ProcessedOdds): Promise<string> {
    const [result] = await knex('odds_snapshots')
      .insert({
        race_id: odds.raceId,
        horse_id: odds.horseId,
        bookmaker_id: odds.bookmakerId,
        market: odds.market,
        win_odds: odds.winOdds,
        place_odds: odds.placeOdds,
        timestamp: odds.timestamp,
        source_type: odds.sourceType,
      })
      .returning('id');

    return result.id;
  }

  /**
   * Store multiple odds snapshots in batch
   */
  async storeOddsSnapshots(oddsArray: ProcessedOdds[]): Promise<number> {
    if (oddsArray.length === 0) {
      return 0;
    }

    // Prepare batch insert data
    const insertData = oddsArray.map(odds => ({
      race_id: odds.raceId,
      horse_id: odds.horseId,
      bookmaker_id: odds.bookmakerId,
      market: odds.market,
      win_odds: odds.winOdds,
      place_odds: odds.placeOdds,
      timestamp: odds.timestamp,
      source_type: odds.sourceType,
    }));

    // Batch insert with chunks to avoid query size limits
    const chunkSize = 1000;
    let totalInserted = 0;

    for (let i = 0; i < insertData.length; i += chunkSize) {
      const chunk = insertData.slice(i, i + chunkSize);
      await knex('odds_snapshots').insert(chunk);
      totalInserted += chunk.length;
    }

    console.log(`Stored ${totalInserted} odds snapshots`);

    // Broadcast odds updates via WebSocket for affected races
    const affectedRaces = new Set(oddsArray.map(odds => odds.raceId));
    
    for (const raceId of affectedRaces) {
      try {
        // Get latest odds for this race to broadcast
        const latestOdds = await this.getLatestOddsForRace(raceId);
        
        if (latestOdds.length > 0) {
          WebSocketService.broadcastOddsUpdate(raceId, {
            odds: latestOdds,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error(`Failed to broadcast odds update for race ${raceId}:`, error);
        // Don't fail the storage operation if broadcast fails
      }
    }

    return totalInserted;
  }

  /**
   * Get latest odds for a race
   */
  async getLatestOddsForRace(raceId: string): Promise<OddsSnapshot[]> {
    // Get the most recent timestamp for this race
    const latestTimestamp = await knex('odds_snapshots')
      .where('race_id', raceId)
      .max('timestamp as max_timestamp')
      .first();

    if (!latestTimestamp?.max_timestamp) {
      return [];
    }

    // Get all odds at that timestamp
    const odds = await knex('odds_snapshots')
      .where('race_id', raceId)
      .where('timestamp', latestTimestamp.max_timestamp)
      .select('*');

    return odds.map(this.mapToOddsSnapshot);
  }

  /**
   * Get odds history for a specific horse in a race
   */
  async getOddsHistory(
    raceId: string,
    horseId: string,
    startTime?: Date,
    endTime?: Date,
    limit: number = 1000
  ): Promise<OddsHistoryPoint[]> {
    let query = knex('odds_snapshots as os')
      .join('bookmakers as b', 'os.bookmaker_id', 'b.id')
      .where('os.race_id', raceId)
      .where('os.horse_id', horseId)
      .select(
        'os.timestamp',
        'os.win_odds as winOdds',
        'os.place_odds as placeOdds',
        'b.name as bookmaker'
      )
      .orderBy('os.timestamp', 'asc')
      .limit(limit);

    if (startTime) {
      query = query.where('os.timestamp', '>=', startTime);
    }

    if (endTime) {
      query = query.where('os.timestamp', '<=', endTime);
    }

    return await query;
  }

  /**
   * Get odds movement summary for a horse
   */
  async getOddsMovementSummary(
    raceId: string,
    horseId: string,
    bookmakerId: string
  ): Promise<{
    openingOdds: number | null;
    currentOdds: number | null;
    highestOdds: number | null;
    lowestOdds: number | null;
    averageOdds: number | null;
    changePercent: number | null;
  }> {
    const stats = await knex('odds_snapshots')
      .where('race_id', raceId)
      .where('horse_id', horseId)
      .where('bookmaker_id', bookmakerId)
      .select(
        knex.raw('MIN(win_odds) as lowest_odds'),
        knex.raw('MAX(win_odds) as highest_odds'),
        knex.raw('AVG(win_odds) as average_odds'),
        knex.raw('FIRST(win_odds, timestamp) as opening_odds'),
        knex.raw('LAST(win_odds, timestamp) as current_odds')
      )
      .first();

    if (!stats) {
      return {
        openingOdds: null,
        currentOdds: null,
        highestOdds: null,
        lowestOdds: null,
        averageOdds: null,
        changePercent: null,
      };
    }

    const changePercent = stats.opening_odds && stats.current_odds
      ? ((stats.current_odds - stats.opening_odds) / stats.opening_odds) * 100
      : null;

    return {
      openingOdds: stats.opening_odds,
      currentOdds: stats.current_odds,
      highestOdds: stats.highest_odds,
      lowestOdds: stats.lowest_odds,
      averageOdds: parseFloat(stats.average_odds),
      changePercent,
    };
  }

  /**
   * Get best odds across all bookmakers for a race
   */
  async getBestOddsForRace(raceId: string): Promise<Map<string, {
    horseId: string;
    horseName: string;
    bestOdds: number;
    bookmaker: string;
    timestamp: Date;
  }>> {
    // Get latest odds for each horse/bookmaker combination
    const latestOdds = await knex('odds_snapshots as os')
      .join('horses as h', 'os.horse_id', 'h.id')
      .join('bookmakers as b', 'os.bookmaker_id', 'b.id')
      .where('os.race_id', raceId)
      .whereIn('os.timestamp', function() {
        this.select(knex.raw('MAX(timestamp)'))
          .from('odds_snapshots')
          .where('race_id', raceId)
          .groupBy('horse_id', 'bookmaker_id');
      })
      .select(
        'os.horse_id as horseId',
        'h.name as horseName',
        'os.win_odds as odds',
        'b.name as bookmaker',
        'os.timestamp'
      );

    // Find best odds for each horse
    const bestOddsMap = new Map();

    for (const odds of latestOdds) {
      const existing = bestOddsMap.get(odds.horseId);

      if (!existing || odds.odds > existing.bestOdds) {
        bestOddsMap.set(odds.horseId, {
          horseId: odds.horseId,
          horseName: odds.horseName,
          bestOdds: parseFloat(odds.odds),
          bookmaker: odds.bookmaker,
          timestamp: odds.timestamp,
        });
      }
    }

    return bestOddsMap;
  }

  /**
   * Query odds with flexible filters
   */
  async queryOdds(query: OddsQuery): Promise<OddsSnapshot[]> {
    let dbQuery = knex('odds_snapshots').select('*');

    if (query.raceId) {
      dbQuery = dbQuery.where('race_id', query.raceId);
    }

    if (query.horseId) {
      dbQuery = dbQuery.where('horse_id', query.horseId);
    }

    if (query.bookmakerId) {
      dbQuery = dbQuery.where('bookmaker_id', query.bookmakerId);
    }

    if (query.startTime) {
      dbQuery = dbQuery.where('timestamp', '>=', query.startTime);
    }

    if (query.endTime) {
      dbQuery = dbQuery.where('timestamp', '<=', query.endTime);
    }

    dbQuery = dbQuery
      .orderBy('timestamp', 'desc')
      .limit(query.limit || 1000);

    const results = await dbQuery;
    return results.map((row) => this.mapToOddsSnapshot(row));
  }

  /**
   * Get odds velocity (rate of change)
   */
  async getOddsVelocity(
    raceId: string,
    horseId: string,
    bookmakerId: string,
    timeWindowMinutes: number = 30
  ): Promise<{
    velocity: number;
    direction: 'up' | 'down' | 'stable';
    recentChange: number;
  }> {
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

    const recentOdds = await knex('odds_snapshots')
      .where('race_id', raceId)
      .where('horse_id', horseId)
      .where('bookmaker_id', bookmakerId)
      .where('timestamp', '>=', cutoffTime)
      .orderBy('timestamp', 'asc')
      .select('win_odds', 'timestamp');

    if (recentOdds.length < 2) {
      return {
        velocity: 0,
        direction: 'stable',
        recentChange: 0,
      };
    }

    const firstOdds = parseFloat(recentOdds[0].win_odds);
    const lastOdds = parseFloat(recentOdds[recentOdds.length - 1].win_odds);
    const timeSpanMinutes = (recentOdds[recentOdds.length - 1].timestamp.getTime() - 
                             recentOdds[0].timestamp.getTime()) / (60 * 1000);

    const recentChange = lastOdds - firstOdds;
    const velocity = timeSpanMinutes > 0 ? recentChange / timeSpanMinutes : 0;

    let direction: 'up' | 'down' | 'stable' = 'stable';
    if (recentChange > 0.05) direction = 'up';
    else if (recentChange < -0.05) direction = 'down';

    return {
      velocity,
      direction,
      recentChange,
    };
  }

  /**
   * Delete old odds data (manual cleanup, retention policy handles automatic)
   */
  async deleteOldOdds(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const deleted = await knex('odds_snapshots')
      .where('timestamp', '<', cutoffDate)
      .delete();

    console.log(`Deleted ${deleted} odds snapshots older than ${olderThanDays} days`);
    return deleted;
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalSnapshots: number;
    oldestSnapshot: Date | null;
    newestSnapshot: Date | null;
    uniqueRaces: number;
    uniqueHorses: number;
    uniqueBookmakers: number;
  }> {
    const stats = await knex('odds_snapshots')
      .select(
        knex.raw('COUNT(*) as total_snapshots'),
        knex.raw('MIN(timestamp) as oldest_snapshot'),
        knex.raw('MAX(timestamp) as newest_snapshot'),
        knex.raw('COUNT(DISTINCT race_id) as unique_races'),
        knex.raw('COUNT(DISTINCT horse_id) as unique_horses'),
        knex.raw('COUNT(DISTINCT bookmaker_id) as unique_bookmakers')
      )
      .first();

    return {
      totalSnapshots: parseInt(stats.total_snapshots),
      oldestSnapshot: stats.oldest_snapshot,
      newestSnapshot: stats.newest_snapshot,
      uniqueRaces: parseInt(stats.unique_races),
      uniqueHorses: parseInt(stats.unique_horses),
      uniqueBookmakers: parseInt(stats.unique_bookmakers),
    };
  }

  /**
   * Map database row to OddsSnapshot
   */
  private mapToOddsSnapshot(row: any): OddsSnapshot {
    return {
      id: row.id,
      raceId: row.race_id,
      horseId: row.horse_id,
      bookmakerId: row.bookmaker_id,
      market: row.market,
      winOdds: parseFloat(row.win_odds),
      placeOdds: row.place_odds ? parseFloat(row.place_odds) : undefined,
      timestamp: row.timestamp,
      sourceType: row.source_type,
    };
  }

  /**
   * Create continuous aggregate for hourly odds averages
   */
  async createHourlyAggregateView(): Promise<void> {
    await knex.raw(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS odds_hourly_avg
      WITH (timescaledb.continuous) AS
      SELECT
        time_bucket('1 hour', timestamp) AS bucket,
        race_id,
        horse_id,
        bookmaker_id,
        AVG(win_odds) as avg_win_odds,
        MIN(win_odds) as min_win_odds,
        MAX(win_odds) as max_win_odds,
        COUNT(*) as sample_count
      FROM odds_snapshots
      GROUP BY bucket, race_id, horse_id, bookmaker_id
      WITH NO DATA;
    `);

    console.log('Created hourly aggregate view');
  }

  /**
   * Refresh continuous aggregate
   */
  async refreshHourlyAggregate(): Promise<void> {
    await knex.raw(`
      CALL refresh_continuous_aggregate('odds_hourly_avg', NULL, NULL);
    `);

    console.log('Refreshed hourly aggregate');
  }
}

export const oddsStorageService = new OddsStorageService();
