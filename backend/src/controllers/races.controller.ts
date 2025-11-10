import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { AppError } from '../middleware/error-handler';
import { db } from '../db/knex';
import { cacheService } from '../services/cache.service';

const CACHE_TTL = 120; // 2 minutes for odds data

/**
 * GET /api/races
 * List all upcoming races with filters
 * OPTIMIZED: Added proper WHERE clause grouping, pagination count, and index usage
 */
export const getRaces = asyncHandler(async (req: Request, res: Response) => {
  const {
    meeting_location,
    meeting_date,
    status = 'upcoming',
    limit = '50',
    offset = '0',
  } = req.query;

  // Parse pagination parameters
  const limitNum = Math.min(parseInt(limit as string) || 50, 100); // Max 100
  const offsetNum = parseInt(offset as string) || 0;

  // Build base query - FIXED: Proper WHERE clause grouping to avoid N+1
  let query = db('races')
    .select(
      'races.*',
      db.raw('COUNT(DISTINCT CASE WHEN race_entries.scratched = false THEN race_entries.id END) as runner_count')
    )
    .leftJoin('race_entries', 'races.id', 'race_entries.race_id')
    .groupBy('races.id');

  // Apply filters before join to use indexes efficiently
  if (status) {
    query = query.where('races.status', status as string);
  }

  if (meeting_location) {
    query = query.where('races.meeting_location', 'ilike', `%${meeting_location}%`);
  }

  if (meeting_date) {
    query = query.where('races.meeting_date', meeting_date as string);
  }

  // Order and paginate
  query = query
    .orderBy('races.start_time', 'asc')
    .limit(limitNum)
    .offset(offsetNum);

  // Execute query
  const races = await query;

  // Get total count for pagination (without limit/offset)
  let countQuery = db('races').count('* as count');

  if (status) {
    countQuery = countQuery.where('status', status as string);
  }

  if (meeting_location) {
    countQuery = countQuery.where('meeting_location', 'ilike', `%${meeting_location}%`);
  }

  if (meeting_date) {
    countQuery = countQuery.where('meeting_date', meeting_date as string);
  }

  const [{ count }] = await countQuery as any;

  res.json({
    status: 'success',
    data: {
      races,
      count: races.length,
      total: parseInt(count),
      limit: limitNum,
      offset: offsetNum,
      hasMore: offsetNum + races.length < parseInt(count),
    },
  });
});

/**
 * GET /api/races/:id
 * Get specific race details
 */
export const getRaceById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const race = await db('races')
    .select('*')
    .where('id', id)
    .first();

  if (!race) {
    throw new AppError('Race not found', 404);
  }

  // Get race entries with horse details
  const entries = await db('race_entries')
    .select(
      'race_entries.*',
      'horses.name as horse_name',
      'horses.age',
      'horses.sex',
      'horses.trainer',
      'horses.jockey',
      'horses.form',
      'horses.weight'
    )
    .join('horses', 'race_entries.horse_id', 'horses.id')
    .where('race_entries.race_id', id)
    .orderBy('race_entries.horse_number', 'asc');

  res.json({
    status: 'success',
    data: {
      race,
      entries,
    },
  });
});

/**
 * GET /api/races/:id/odds
 * Get current odds for race
 */
export const getRaceOdds = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check cache first
  const cacheKey = `odds:race:${id}`;
  const cachedOdds = await cacheService.get<any>(cacheKey);

  if (cachedOdds) {
    return res.json({
      status: 'success',
      data: {
        odds: cachedOdds,
        cached: true,
      },
    });
  }

  // Verify race exists
  const race = await db('races').where('id', id).first();
  if (!race) {
    throw new AppError('Race not found', 404);
  }

  // Get latest odds for each horse/bookmaker combination
  const latestOdds = await db('odds_snapshots')
    .select(
      'odds_snapshots.horse_id',
      'odds_snapshots.bookmaker_id',
      'odds_snapshots.win_odds',
      'odds_snapshots.place_odds',
      'odds_snapshots.timestamp',
      'odds_snapshots.source_type',
      'horses.name as horse_name',
      'horses.jockey',
      'horses.trainer',
      'bookmakers.name as bookmaker_name',
      'bookmakers.slug as bookmaker_slug',
      'race_entries.horse_number'
    )
    .join('horses', 'odds_snapshots.horse_id', 'horses.id')
    .join('bookmakers', 'odds_snapshots.bookmaker_id', 'bookmakers.id')
    .join('race_entries', function() {
      this.on('race_entries.horse_id', '=', 'odds_snapshots.horse_id')
        .andOn('race_entries.race_id', '=', db.raw('?', [id]));
    })
    .where('odds_snapshots.race_id', id)
    .whereRaw(`
      odds_snapshots.timestamp = (
        SELECT MAX(timestamp)
        FROM odds_snapshots os2
        WHERE os2.race_id = odds_snapshots.race_id
          AND os2.horse_id = odds_snapshots.horse_id
          AND os2.bookmaker_id = odds_snapshots.bookmaker_id
      )
    `)
    .orderBy('race_entries.horse_number', 'asc');

  // Group odds by horse
  const oddsGrouped = latestOdds.reduce((acc: any, odd: any) => {
    const horseKey = odd.horse_id;
    
    if (!acc[horseKey]) {
      acc[horseKey] = {
        horse_id: odd.horse_id,
        horse_name: odd.horse_name,
        horse_number: odd.horse_number,
        jockey: odd.jockey,
        trainer: odd.trainer,
        bookmaker_odds: [],
      };
    }

    acc[horseKey].bookmaker_odds.push({
      bookmaker_id: odd.bookmaker_id,
      bookmaker_name: odd.bookmaker_name,
      bookmaker_slug: odd.bookmaker_slug,
      win_odds: parseFloat(odd.win_odds),
      place_odds: odd.place_odds ? parseFloat(odd.place_odds) : null,
      timestamp: odd.timestamp,
      source_type: odd.source_type,
    });

    return acc;
  }, {});

  const oddsArray = Object.values(oddsGrouped);

  // Cache the result
  await cacheService.set(cacheKey, oddsArray, CACHE_TTL);

  return res.json({
    status: 'success',
    data: {
      odds: oddsArray,
      cached: false,
    },
  });
});

/**
 * GET /api/races/:id/history
 * Get historical odds for race
 */
export const getRaceOddsHistory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { horse_id, bookmaker_id, hours = '24' } = req.query;

  // Verify race exists
  const race = await db('races').where('id', id).first();
  if (!race) {
    throw new AppError('Race not found', 404);
  }

  const hoursAgo = parseInt(hours as string);
  const startTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

  let query = db('odds_snapshots')
    .select(
      'odds_snapshots.*',
      'horses.name as horse_name',
      'horses.jockey',
      'bookmakers.name as bookmaker_name',
      'bookmakers.slug as bookmaker_slug',
      'race_entries.horse_number'
    )
    .join('horses', 'odds_snapshots.horse_id', 'horses.id')
    .join('bookmakers', 'odds_snapshots.bookmaker_id', 'bookmakers.id')
    .join('race_entries', function() {
      this.on('race_entries.horse_id', '=', 'odds_snapshots.horse_id')
        .andOn('race_entries.race_id', '=', db.raw('?', [id]));
    })
    .where('odds_snapshots.race_id', id)
    .where('odds_snapshots.timestamp', '>=', startTime)
    .orderBy('odds_snapshots.timestamp', 'asc');

  if (horse_id) {
    query = query.where('odds_snapshots.horse_id', horse_id as string);
  }

  if (bookmaker_id) {
    query = query.where('odds_snapshots.bookmaker_id', bookmaker_id as string);
  }

  const history = await query;

  // Calculate opening odds (first snapshot) and current odds (latest snapshot)
  const summary = await db('odds_snapshots')
    .select(
      'horse_id',
      db.raw('MIN(timestamp) as first_seen'),
      db.raw('MAX(timestamp) as last_seen'),
      db.raw(`
        (ARRAY_AGG(win_odds ORDER BY timestamp ASC))[1] as opening_odds
      `),
      db.raw(`
        (ARRAY_AGG(win_odds ORDER BY timestamp DESC))[1] as current_odds
      `)
    )
    .where('race_id', id)
    .where('timestamp', '>=', startTime)
    .groupBy('horse_id');

  res.json({
    status: 'success',
    data: {
      history,
      summary,
      period_hours: hoursAgo,
    },
  });
});
