import { db } from '../db/knex';
import { cacheService } from './cache.service';
import { CacheKeys, CacheTTL } from '../config/redis';

/**
 * Cache Warming Service
 * Pre-populates cache with frequently accessed data to improve response times
 */

export class CacheWarmingService {
  private isWarming = false;
  private warmingInterval: NodeJS.Timeout | null = null;

  /**
   * Warm all caches
   */
  async warmAll(): Promise<void> {
    if (this.isWarming) {
      console.log('Cache warming already in progress');
      return;
    }

    this.isWarming = true;
    console.log('Starting cache warming...');

    try {
      await Promise.all([
        this.warmUpcomingRaces(),
        this.warmActiveBookmakers(),
        this.warmLatestNews(),
        this.warmActiveAmbassadors(),
        this.warmPopularRaceOdds(),
      ]);

      console.log('Cache warming completed successfully');
    } catch (error) {
      console.error('Cache warming failed:', error);
    } finally {
      this.isWarming = false;
    }
  }

  /**
   * Warm upcoming races cache
   */
  async warmUpcomingRaces(): Promise<void> {
    try {
      console.log('Warming upcoming races cache...');

      // Get upcoming races for the next 24 hours
      const races = await db('races')
        .select(
          'races.*',
          db.raw('COUNT(DISTINCT race_entries.id) as runner_count')
        )
        .leftJoin('race_entries', 'races.id', 'race_entries.race_id')
        .where('races.status', 'upcoming')
        .where('races.start_time', '>=', new Date())
        .where('races.start_time', '<=', new Date(Date.now() + 24 * 60 * 60 * 1000))
        .groupBy('races.id')
        .orderBy('races.start_time', 'asc')
        .limit(100);

      const cacheKey = CacheKeys.cache.races.upcoming();
      await cacheService.set(cacheKey, races, CacheTTL.RACES_UPCOMING);

      console.log(`Warmed ${races.length} upcoming races`);
    } catch (error) {
      console.error('Failed to warm upcoming races cache:', error);
    }
  }

  /**
   * Warm active bookmakers cache
   */
  async warmActiveBookmakers(): Promise<void> {
    try {
      console.log('Warming bookmakers cache...');

      // Get all active bookmakers
      const bookmakers = await db('bookmakers')
        .select(
          'bookmakers.*',
          db.raw('COUNT(DISTINCT bookmaker_features.id) as feature_count')
        )
        .leftJoin('bookmaker_features', 'bookmakers.id', 'bookmaker_features.bookmaker_id')
        .where('bookmakers.status', 'active')
        .groupBy('bookmakers.id')
        .orderBy('bookmakers.rating', 'desc');

      // Cache all bookmakers
      await cacheService.set(
        CacheKeys.cache.bookmakers.all(),
        bookmakers,
        CacheTTL.BOOKMAKERS
      );

      // Cache active bookmakers
      const activeBookmakers = bookmakers.filter(b => b.status === 'active');
      await cacheService.set(
        CacheKeys.cache.bookmakers.active(),
        activeBookmakers,
        CacheTTL.BOOKMAKERS
      );

      // Cache individual bookmakers
      await Promise.all(
        bookmakers.map(bookmaker =>
          cacheService.set(
            CacheKeys.cache.bookmakers.byId(bookmaker.id),
            bookmaker,
            CacheTTL.BOOKMAKERS
          )
        )
      );

      console.log(`Warmed ${bookmakers.length} bookmakers`);
    } catch (error) {
      console.error('Failed to warm bookmakers cache:', error);
    }
  }

  /**
   * Warm latest news cache
   */
  async warmLatestNews(): Promise<void> {
    try {
      console.log('Warming latest news cache...');

      // Get latest news articles
      const articles = await db('news_articles')
        .select(
          'news_articles.*',
          db.raw('COUNT(DISTINCT news_article_entities.id) as entity_count')
        )
        .leftJoin(
          'news_article_entities',
          'news_articles.id',
          'news_article_entities.article_id'
        )
        .groupBy('news_articles.id')
        .orderBy('news_articles.published_at', 'desc')
        .limit(50);

      await cacheService.set(
        CacheKeys.cache.news.latest(),
        articles,
        CacheTTL.NEWS_LATEST
      );

      console.log(`Warmed ${articles.length} news articles`);
    } catch (error) {
      console.error('Failed to warm news cache:', error);
    }
  }

  /**
   * Warm active ambassadors cache
   */
  async warmActiveAmbassadors(): Promise<void> {
    try {
      console.log('Warming ambassadors cache...');

      // Get active ambassadors
      const ambassadors = await db('ambassadors')
        .select('*')
        .where('status', 'active')
        .orderBy('joined_at', 'desc');

      await cacheService.set(
        CacheKeys.cache.ambassadors.all(),
        ambassadors,
        CacheTTL.AMBASSADORS
      );

      // Cache individual ambassadors by slug
      await Promise.all(
        ambassadors.map(ambassador =>
          cacheService.set(
            CacheKeys.cache.ambassadors.bySlug(ambassador.slug),
            ambassador,
            CacheTTL.AMBASSADORS
          )
        )
      );

      console.log(`Warmed ${ambassadors.length} ambassadors`);
    } catch (error) {
      console.error('Failed to warm ambassadors cache:', error);
    }
  }

  /**
   * Warm popular race odds
   */
  async warmPopularRaceOdds(): Promise<void> {
    try {
      console.log('Warming popular race odds...');

      // Get upcoming races in the next 6 hours
      const upcomingRaces = await db('races')
        .select('id')
        .where('status', 'upcoming')
        .where('start_time', '>=', new Date())
        .where('start_time', '<=', new Date(Date.now() + 6 * 60 * 60 * 1000))
        .orderBy('start_time', 'asc')
        .limit(20);

      // Warm odds for each race
      let warmedCount = 0;
      for (const race of upcomingRaces) {
        try {
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
                .andOn('race_entries.race_id', '=', db.raw('?', [race.id]));
            })
            .where('odds_snapshots.race_id', race.id)
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

          if (latestOdds.length > 0) {
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

            const cacheKey = CacheKeys.odds.race(race.id);
            await cacheService.set(cacheKey, oddsArray, CacheTTL.ODDS);

            warmedCount++;
          }
        } catch (error) {
          console.error(`Failed to warm odds for race ${race.id}:`, error);
        }
      }

      console.log(`Warmed odds for ${warmedCount} races`);
    } catch (error) {
      console.error('Failed to warm race odds:', error);
    }
  }

  /**
   * Start automatic cache warming
   * Warms cache at regular intervals
   */
  startAutomaticWarming(intervalMinutes: number = 10): void {
    if (this.warmingInterval) {
      console.log('Automatic cache warming already running');
      return;
    }

    console.log(`Starting automatic cache warming (every ${intervalMinutes} minutes)`);

    // Initial warming
    this.warmAll();

    // Set up interval
    this.warmingInterval = setInterval(() => {
      this.warmAll();
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Stop automatic cache warming
   */
  stopAutomaticWarming(): void {
    if (this.warmingInterval) {
      clearInterval(this.warmingInterval);
      this.warmingInterval = null;
      console.log('Automatic cache warming stopped');
    }
  }

  /**
   * Warm specific race odds
   */
  async warmRaceOdds(raceId: string): Promise<void> {
    try {
      const latestOdds = await db('odds_snapshots')
        .select(
          'odds_snapshots.horse_id',
          'odds_snapshots.bookmaker_id',
          'odds_snapshots.win_odds',
          'odds_snapshots.place_odds',
          'odds_snapshots.timestamp',
          'horses.name as horse_name',
          'bookmakers.name as bookmaker_name',
          'race_entries.horse_number'
        )
        .join('horses', 'odds_snapshots.horse_id', 'horses.id')
        .join('bookmakers', 'odds_snapshots.bookmaker_id', 'bookmakers.id')
        .join('race_entries', function() {
          this.on('race_entries.horse_id', '=', 'odds_snapshots.horse_id')
            .andOn('race_entries.race_id', '=', db.raw('?', [raceId]));
        })
        .where('odds_snapshots.race_id', raceId)
        .whereRaw(`
          odds_snapshots.timestamp = (
            SELECT MAX(timestamp)
            FROM odds_snapshots os2
            WHERE os2.race_id = odds_snapshots.race_id
              AND os2.horse_id = odds_snapshots.horse_id
              AND os2.bookmaker_id = odds_snapshots.bookmaker_id
          )
        `);

      const cacheKey = CacheKeys.odds.race(raceId);
      await cacheService.set(cacheKey, latestOdds, CacheTTL.ODDS);

      console.log(`Warmed odds for race ${raceId}`);
    } catch (error) {
      console.error(`Failed to warm race ${raceId} odds:`, error);
    }
  }

  /**
   * Invalidate and re-warm specific cache
   */
  async refreshCache(cacheType: 'races' | 'bookmakers' | 'news' | 'ambassadors'): Promise<void> {
    console.log(`Refreshing ${cacheType} cache...`);

    switch (cacheType) {
      case 'races':
        await cacheService.deletePattern('cache:races:*');
        await this.warmUpcomingRaces();
        break;

      case 'bookmakers':
        await cacheService.deletePattern('cache:bookmakers:*');
        await this.warmActiveBookmakers();
        break;

      case 'news':
        await cacheService.deletePattern('cache:news:*');
        await this.warmLatestNews();
        break;

      case 'ambassadors':
        await cacheService.deletePattern('cache:ambassadors:*');
        await this.warmActiveAmbassadors();
        break;

      default:
        console.warn(`Unknown cache type: ${cacheType}`);
    }
  }
}

export const cacheWarmingService = new CacheWarmingService();
