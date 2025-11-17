import { Request, Response } from 'express';
import db from '../config/database';

interface MarketMover {
  horse_name: string;
  race_id: string;
  race_name: string;
  track_name: string;
  race_number: number;
  distance: number;
  old_odds: number;
  new_odds: number;
  odds_change_percent: number;
  best_bookmaker_id: string;
  best_bookmaker_name: string;
  type: 'steamer' | 'drifter';
}

export async function getMarketMovers(req: Request, res: Response) {
  try {
    const { limit = 5, timeframe = 60 } = req.query; // timeframe in minutes

    // Get market movers (steamers and drifters) by comparing odds over time
    const movers = await db.raw(`
      WITH latest_odds AS (
        SELECT DISTINCT ON (os.horse_id, os.race_id)
          os.horse_id,
          os.race_id,
          os.win_odds as current_odds,
          os.bookmaker_id as current_bookmaker_id,
          os.timestamp as current_timestamp,
          h.name as horse_name,
          r.number as race_number,
          r.distance,
          m.name as track_name,
          b.name as bookmaker_name
        FROM odds_snapshots os
        JOIN horses h ON os.horse_id = h.id
        JOIN races r ON os.race_id = r.id
        JOIN meetings m ON r.meeting_id = m.id
        JOIN bookmakers b ON os.bookmaker_id = b.id
        WHERE os.timestamp >= NOW() - INTERVAL '${parseInt(timeframe as string)} minutes'
          AND r.start_time > NOW()  -- Only upcoming races
        ORDER BY os.horse_id, os.race_id, os.timestamp DESC
      ),
      earlier_odds AS (
        SELECT DISTINCT ON (os.horse_id, os.race_id)
          os.horse_id,
          os.race_id,
          os.win_odds as earlier_odds,
          os.timestamp as earlier_timestamp
        FROM odds_snapshots os
        JOIN races r ON os.race_id = r.id
        WHERE os.timestamp >= NOW() - INTERVAL '${parseInt(timeframe as string) * 2} minutes'
          AND os.timestamp <= NOW() - INTERVAL '${parseInt(timeframe as string)} minutes'
          AND r.start_time > NOW()
        ORDER BY os.horse_id, os.race_id, os.timestamp DESC
      )
      SELECT
        lo.horse_name,
        lo.race_id,
        CONCAT(lo.track_name, ' R', lo.race_number) as race_name,
        lo.track_name,
        lo.race_number,
        lo.distance,
        eo.earlier_odds as old_odds,
        lo.current_odds as new_odds,
        ((eo.earlier_odds - lo.current_odds) / eo.earlier_odds * 100)::numeric(10,2) as odds_change_percent,
        lo.current_bookmaker_id as best_bookmaker_id,
        lo.bookmaker_name as best_bookmaker_name,
        CASE
          WHEN lo.current_odds < eo.earlier_odds THEN 'steamer'
          ELSE 'drifter'
        END as type
      FROM latest_odds lo
      JOIN earlier_odds eo ON lo.horse_id = eo.horse_id AND lo.race_id = eo.race_id
      WHERE ABS((eo.earlier_odds - lo.current_odds) / eo.earlier_odds * 100) >= 10  -- At least 10% change
      ORDER BY ABS(odds_change_percent) DESC
      LIMIT ?
    `, [parseInt(limit as string)]);

    // Separate steamers and drifters
    const steamers = movers.rows.filter((m: MarketMover) => m.type === 'steamer');
    const drifters = movers.rows.filter((m: MarketMover) => m.type === 'drifter');

    res.json({
      steamers,
      drifters,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching market movers:', error);
    res.status(500).json({
      error: 'Failed to fetch market movers',
      steamers: [],
      drifters: [],
    });
  }
}
