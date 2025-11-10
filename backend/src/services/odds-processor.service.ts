import { NormalizedOdds } from '../types/bookmaker.types';
import { db as knex } from '../db/knex';

/**
 * Odds Data Processor Service
 * Handles odds normalization, race/horse matching, and duplicate detection
 */

export interface ProcessedOdds {
  raceId: string;
  horseId: string;
  bookmakerId: string;
  winOdds: number;
  placeOdds?: number;
  market: string;
  timestamp: Date;
  sourceType: 'api' | 'scraper';
}

export interface RaceMatchResult {
  raceId: string | null;
  confidence: number;
  matchedBy: 'exact' | 'fuzzy' | 'none';
}

export interface HorseMatchResult {
  horseId: string | null;
  confidence: number;
  matchedBy: 'exact' | 'fuzzy' | 'none';
}

export class OddsProcessorService {
  /**
   * Process normalized odds data and match to database entities
   */
  async processOdds(normalizedOdds: NormalizedOdds[]): Promise<ProcessedOdds[]> {
    const processed: ProcessedOdds[] = [];

    for (const odds of normalizedOdds) {
      try {
        // Match race
        const raceMatch = await this.matchRace(odds.raceId, odds.timestamp);
        if (!raceMatch.raceId) {
          console.warn(`Could not match race for odds: ${odds.raceId}`);
          continue;
        }

        // Match horse
        const horseMatch = await this.matchHorse(
          odds.horseName,
          raceMatch.raceId
        );
        if (!horseMatch.horseId) {
          console.warn(`Could not match horse: ${odds.horseName} in race ${raceMatch.raceId}`);
          continue;
        }

        // Match bookmaker
        const bookmakerId = await this.matchBookmaker(odds.bookmaker);
        if (!bookmakerId) {
          console.warn(`Could not match bookmaker: ${odds.bookmaker}`);
          continue;
        }

        processed.push({
          raceId: raceMatch.raceId,
          horseId: horseMatch.horseId,
          bookmakerId,
          winOdds: odds.winOdds,
          placeOdds: odds.placeOdds,
          market: odds.market,
          timestamp: odds.timestamp,
          sourceType: odds.sourceType,
        });
      } catch (error) {
        console.error(`Error processing odds for ${odds.horseName}:`, error);
      }
    }

    return processed;
  }

  /**
   * Match race by ID or attributes
   */
  async matchRace(
    raceIdentifier: string,
    timestamp: Date
  ): Promise<RaceMatchResult> {
    // Try exact UUID match first
    if (this.isUUID(raceIdentifier)) {
      const race = await knex('races')
        .where('id', raceIdentifier)
        .first();

      if (race) {
        return {
          raceId: race.id,
          confidence: 1.0,
          matchedBy: 'exact',
        };
      }
    }

    // Try to parse race identifier (format: "location-date-raceNumber")
    const parts = raceIdentifier.split('-');
    if (parts.length >= 3) {
      const location = parts.slice(0, -2).join('-');
      const date = parts[parts.length - 2];
      const raceNumber = parseInt(parts[parts.length - 1], 10);

      if (!isNaN(raceNumber)) {
        const race = await knex('races')
          .where('meeting_location', 'ilike', `%${location}%`)
          .whereRaw('DATE(meeting_date) = ?', [date])
          .where('race_number', raceNumber)
          .first();

        if (race) {
          return {
            raceId: race.id,
            confidence: 0.9,
            matchedBy: 'exact',
          };
        }
      }
    }

    // Fuzzy match by time window (races starting within 1 hour)
    const timeWindow = 60 * 60 * 1000; // 1 hour
    const startTime = new Date(timestamp.getTime() - timeWindow);
    const endTime = new Date(timestamp.getTime() + timeWindow);

    const races = await knex('races')
      .whereBetween('start_time', [startTime, endTime])
      .where('status', 'upcoming')
      .orderBy('start_time', 'asc')
      .limit(1);

    if (races.length > 0) {
      return {
        raceId: races[0].id,
        confidence: 0.5,
        matchedBy: 'fuzzy',
      };
    }

    return {
      raceId: null,
      confidence: 0,
      matchedBy: 'none',
    };
  }

  /**
   * Match horse by name within a specific race
   */
  async matchHorse(
    horseName: string,
    raceId: string
  ): Promise<HorseMatchResult> {
    // Normalize horse name for matching
    const normalizedName = this.normalizeHorseName(horseName);

    // Try exact match first
    const exactMatch = await knex('horses as h')
      .join('race_entries as re', 'h.id', 're.horse_id')
      .where('re.race_id', raceId)
      .where('re.scratched', false)
      .whereRaw('LOWER(h.name) = ?', [normalizedName.toLowerCase()])
      .select('h.id')
      .first();

    if (exactMatch) {
      return {
        horseId: exactMatch.id,
        confidence: 1.0,
        matchedBy: 'exact',
      };
    }

    // Try fuzzy match using similarity
    const fuzzyMatches = await knex('horses as h')
      .join('race_entries as re', 'h.id', 're.horse_id')
      .where('re.race_id', raceId)
      .where('re.scratched', false)
      .whereRaw('LOWER(h.name) LIKE ?', [`%${normalizedName.toLowerCase()}%`])
      .select('h.id', 'h.name')
      .limit(1);

    if (fuzzyMatches.length > 0) {
      return {
        horseId: fuzzyMatches[0].id,
        confidence: 0.7,
        matchedBy: 'fuzzy',
      };
    }

    return {
      horseId: null,
      confidence: 0,
      matchedBy: 'none',
    };
  }

  /**
   * Match bookmaker by name or key
   */
  async matchBookmaker(bookmakerKey: string): Promise<string | null> {
    // Try exact match by slug
    const bookmaker = await knex('bookmakers')
      .where('slug', bookmakerKey.toLowerCase())
      .orWhere('name', 'ilike', bookmakerKey)
      .first();

    return bookmaker?.id || null;
  }

  /**
   * Normalize horse name for matching
   */
  private normalizeHorseName(name: string): string {
    return name
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '');
  }

  /**
   * Check if string is a valid UUID
   */
  private isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Detect duplicate odds within a time window
   */
  async detectDuplicates(
    processedOdds: ProcessedOdds[],
    timeWindowSeconds: number = 60
  ): Promise<ProcessedOdds[]> {
    const uniqueOdds: ProcessedOdds[] = [];
    const seen = new Set<string>();

    for (const odds of processedOdds) {
      // Create a unique key for deduplication
      const key = this.createOddsKey(odds);

      // Check if we've seen this exact odds entry recently
      const isDuplicate = await this.checkRecentDuplicate(
        odds,
        timeWindowSeconds
      );

      if (!isDuplicate && !seen.has(key)) {
        uniqueOdds.push(odds);
        seen.add(key);
      }
    }

    return uniqueOdds;
  }

  /**
   * Create a unique key for odds deduplication
   */
  private createOddsKey(odds: ProcessedOdds): string {
    return `${odds.raceId}-${odds.horseId}-${odds.bookmakerId}-${odds.winOdds}`;
  }

  /**
   * Check if similar odds exist in recent history
   */
  private async checkRecentDuplicate(
    odds: ProcessedOdds,
    timeWindowSeconds: number
  ): Promise<boolean> {
    const cutoffTime = new Date(
      odds.timestamp.getTime() - timeWindowSeconds * 1000
    );

    const existing = await knex('odds_snapshots')
      .where('race_id', odds.raceId)
      .where('horse_id', odds.horseId)
      .where('bookmaker_id', odds.bookmakerId)
      .where('win_odds', odds.winOdds)
      .where('timestamp', '>=', cutoffTime)
      .first();

    return !!existing;
  }

  /**
   * Batch process odds for multiple races
   */
  async batchProcessOdds(
    oddsGroups: Map<string, NormalizedOdds[]>
  ): Promise<Map<string, ProcessedOdds[]>> {
    const results = new Map<string, ProcessedOdds[]>();

    for (const [raceKey, odds] of oddsGroups.entries()) {
      try {
        const processed = await this.processOdds(odds);
        const deduplicated = await this.detectDuplicates(processed);
        results.set(raceKey, deduplicated);
      } catch (error) {
        console.error(`Error batch processing odds for ${raceKey}:`, error);
        results.set(raceKey, []);
      }
    }

    return results;
  }

  /**
   * Get processing statistics
   */
  getProcessingStats(
    input: NormalizedOdds[],
    output: ProcessedOdds[]
  ): {
    total: number;
    processed: number;
    failed: number;
    successRate: number;
  } {
    const total = input.length;
    const processed = output.length;
    const failed = total - processed;
    const successRate = total > 0 ? (processed / total) * 100 : 0;

    return {
      total,
      processed,
      failed,
      successRate,
    };
  }
}

export const oddsProcessorService = new OddsProcessorService();
