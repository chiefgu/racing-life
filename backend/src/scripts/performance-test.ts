#!/usr/bin/env node

/**
 * Performance Testing Script
 * Tests database query performance and cache effectiveness
 */

import { db } from '../db/knex';
import { cacheService } from '../services/cache.service';
import { DatabaseMonitor } from '../utils/db-monitor';

interface TestResult {
  name: string;
  duration: number;
  queries: number;
  rowsReturned?: number;
  cacheHit?: boolean;
  success: boolean;
  error?: string;
}

class PerformanceTest {
  private results: TestResult[] = [];

  /**
   * Run a test and measure performance
   */
  async runTest(
    name: string,
    testFn: () => Promise<any>
  ): Promise<TestResult> {
    console.log(`\nRunning: ${name}...`);

    const startQueries = DatabaseMonitor.getQueryCount();
    const startTime = Date.now();

    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      const queries = DatabaseMonitor.getQueryCount() - startQueries;

      const rowsReturned = Array.isArray(result) ? result.length : undefined;

      const testResult: TestResult = {
        name,
        duration,
        queries,
        rowsReturned,
        success: true,
      };

      console.log(`✓ ${name} - ${duration}ms (${queries} queries)`);
      this.results.push(testResult);

      return testResult;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      const testResult: TestResult = {
        name,
        duration,
        queries: 0,
        success: false,
        error: error.message,
      };

      console.error(`✗ ${name} - Failed: ${error.message}`);
      this.results.push(testResult);

      return testResult;
    }
  }

  /**
   * Test upcoming races query
   */
  async testUpcomingRaces(): Promise<void> {
    await this.runTest('Get Upcoming Races (No Cache)', async () => {
      return await db('races')
        .select(
          'races.*',
          db.raw('COUNT(DISTINCT CASE WHEN race_entries.scratched = false THEN race_entries.id END) as runner_count')
        )
        .leftJoin('race_entries', 'races.id', 'race_entries.race_id')
        .where('races.status', 'upcoming')
        .groupBy('races.id')
        .orderBy('races.start_time', 'asc')
        .limit(50);
    });
  }

  /**
   * Test race with entries
   */
  async testRaceWithEntries(): Promise<void> {
    // First get a race ID
    const race = await db('races')
      .select('id')
      .where('status', 'upcoming')
      .first();

    if (!race) {
      console.log('⊘ Skipping race entries test - no races found');
      return;
    }

    await this.runTest('Get Race with Entries', async () => {
      const [raceData, entries] = await Promise.all([
        db('races').where('id', race.id).first(),
        db('race_entries')
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
          .where('race_entries.race_id', race.id)
          .orderBy('race_entries.horse_number', 'asc'),
      ]);

      return { race: raceData, entries };
    });
  }

  /**
   * Test race odds query
   */
  async testRaceOdds(): Promise<void> {
    const race = await db('races')
      .select('id')
      .where('status', 'upcoming')
      .first();

    if (!race) {
      console.log('⊘ Skipping race odds test - no races found');
      return;
    }

    await this.runTest('Get Latest Race Odds', async () => {
      return await db('odds_snapshots')
        .select(
          'odds_snapshots.horse_id',
          'odds_snapshots.bookmaker_id',
          'odds_snapshots.win_odds',
          'odds_snapshots.place_odds',
          'odds_snapshots.timestamp',
          'horses.name as horse_name',
          'bookmakers.name as bookmaker_name'
        )
        .join('horses', 'odds_snapshots.horse_id', 'horses.id')
        .join('bookmakers', 'odds_snapshots.bookmaker_id', 'bookmakers.id')
        .where('odds_snapshots.race_id', race.id)
        .whereRaw(`
          odds_snapshots.timestamp = (
            SELECT MAX(timestamp)
            FROM odds_snapshots os2
            WHERE os2.race_id = odds_snapshots.race_id
              AND os2.horse_id = odds_snapshots.horse_id
              AND os2.bookmaker_id = odds_snapshots.bookmaker_id
          )
        `);
    });
  }

  /**
   * Test news articles query
   */
  async testNewsArticles(): Promise<void> {
    await this.runTest('Get Latest News Articles', async () => {
      return await db('news_articles')
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
    });
  }

  /**
   * Test bookmakers query
   */
  async testBookmakers(): Promise<void> {
    await this.runTest('Get Active Bookmakers', async () => {
      return await db('bookmakers')
        .select(
          'bookmakers.*',
          db.raw('COUNT(DISTINCT bookmaker_features.id) as feature_count')
        )
        .leftJoin('bookmaker_features', 'bookmakers.id', 'bookmaker_features.bookmaker_id')
        .where('bookmakers.status', 'active')
        .groupBy('bookmakers.id')
        .orderBy('bookmakers.rating', 'desc');
    });
  }

  /**
   * Test cache performance
   */
  async testCachePerformance(): Promise<void> {
    const cacheKey = 'test:performance:data';
    const testData = { timestamp: new Date(), data: 'Test data for cache performance' };

    // Test cache set
    await this.runTest('Cache Set Operation', async () => {
      await cacheService.set(cacheKey, testData, 60);
      return { success: true };
    });

    // Test cache get (hit)
    await this.runTest('Cache Get Operation (HIT)', async () => {
      const result = await cacheService.get(cacheKey);
      if (!result) throw new Error('Cache miss when hit expected');
      return result;
    });

    // Test cache delete
    await this.runTest('Cache Delete Operation', async () => {
      await cacheService.delete(cacheKey);
      return { success: true };
    });

    // Test cache get (miss)
    await this.runTest('Cache Get Operation (MISS)', async () => {
      const result = await cacheService.get(cacheKey);
      if (result) throw new Error('Cache hit when miss expected');
      return null;
    });
  }

  /**
   * Test complex join query
   */
  async testComplexJoin(): Promise<void> {
    await this.runTest('Complex Join Query (Races + Entries + Horses)', async () => {
      return await db('races')
        .select(
          'races.*',
          'race_entries.horse_number',
          'horses.name as horse_name',
          'horses.trainer',
          'horses.jockey'
        )
        .join('race_entries', 'races.id', 'race_entries.race_id')
        .join('horses', 'race_entries.horse_id', 'horses.id')
        .where('races.status', 'upcoming')
        .where('race_entries.scratched', false)
        .orderBy('races.start_time', 'asc')
        .limit(100);
    });
  }

  /**
   * Test index effectiveness
   */
  async testIndexEffectiveness(): Promise<void> {
    // Test indexed query (status column has index)
    await this.runTest('Indexed Query (races.status)', async () => {
      return await db('races')
        .select('*')
        .where('status', 'upcoming')
        .limit(100);
    });

    // Test composite index query
    await this.runTest('Composite Index Query (meeting_date + location)', async () => {
      const today = new Date().toISOString().split('T')[0];
      return await db('races')
        .select('*')
        .where('meeting_date', today)
        .orderBy('meeting_location')
        .limit(50);
    });
  }

  /**
   * Test pagination performance
   */
  async testPagination(): Promise<void> {
    await this.runTest('Pagination - Page 1 (OFFSET 0)', async () => {
      return await db('news_articles')
        .select('*')
        .orderBy('published_at', 'desc')
        .limit(50)
        .offset(0);
    });

    await this.runTest('Pagination - Page 10 (OFFSET 450)', async () => {
      return await db('news_articles')
        .select('*')
        .orderBy('published_at', 'desc')
        .limit(50)
        .offset(450);
    });
  }

  /**
   * Print test summary
   */
  printSummary(): void {
    console.log('\n' + '='.repeat(80));
    console.log('PERFORMANCE TEST SUMMARY');
    console.log('='.repeat(80));

    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);

    console.log(`\nTotal Tests: ${this.results.length}`);
    console.log(`Successful: ${successful.length}`);
    console.log(`Failed: ${failed.length}`);

    if (successful.length > 0) {
      console.log('\n--- Successful Tests ---');

      const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;
      const avgQueries = successful.reduce((sum, r) => sum + r.queries, 0) / successful.length;

      console.log(`Average Duration: ${avgDuration.toFixed(2)}ms`);
      console.log(`Average Queries: ${avgQueries.toFixed(2)}`);

      // Sort by duration
      const sorted = [...successful].sort((a, b) => b.duration - a.duration);

      console.log('\nSlowest Tests:');
      sorted.slice(0, 5).forEach((result, index) => {
        console.log(
          `${index + 1}. ${result.name}: ${result.duration}ms (${result.queries} queries)`
        );
      });

      console.log('\nFastest Tests:');
      sorted.slice(-5).reverse().forEach((result, index) => {
        console.log(
          `${index + 1}. ${result.name}: ${result.duration}ms (${result.queries} queries)`
        );
      });
    }

    if (failed.length > 0) {
      console.log('\n--- Failed Tests ---');
      failed.forEach(result => {
        console.log(`✗ ${result.name}: ${result.error}`);
      });
    }

    console.log('\n' + '='.repeat(80));
  }

  /**
   * Run all tests
   */
  async runAll(): Promise<void> {
    console.log('Starting Performance Tests...\n');

    // Enable database monitoring
    DatabaseMonitor.enableQueryMonitoring();
    DatabaseMonitor.clearStats();

    try {
      // Run tests
      await this.testCachePerformance();
      await this.testBookmakers();
      await this.testUpcomingRaces();
      await this.testRaceWithEntries();
      await this.testRaceOdds();
      await this.testNewsArticles();
      await this.testComplexJoin();
      await this.testIndexEffectiveness();
      await this.testPagination();

      // Print summary
      this.printSummary();

      // Get database stats
      console.log('\n--- Database Statistics ---');
      const dbStats = await DatabaseMonitor.getDatabaseStats();

      console.log('\nHealth:');
      console.log(`  Connected: ${dbStats.health.isConnected}`);
      console.log(`  Response Time: ${dbStats.health.responseTime}ms`);
      console.log(`  Active Connections: ${dbStats.health.activeConnections}`);
      console.log(`  Pool: ${dbStats.health.poolStats.used}/${dbStats.health.poolStats.total} used`);

      console.log('\nQuery Stats:');
      console.log(`  Total Queries: ${dbStats.queryStats.total}`);
      console.log(`  Average Duration: ${dbStats.queryStats.averageDuration.toFixed(2)}ms`);
      console.log(`  Slow Queries: ${dbStats.queryStats.slowQueries}`);
      console.log(`  Cache Hit Rate: ${dbStats.cacheHitRate.toFixed(2)}%`);

      if (dbStats.tableSizes.length > 0) {
        console.log('\nLargest Tables:');
        dbStats.tableSizes.slice(0, 5).forEach((table, index) => {
          console.log(`  ${index + 1}. ${table.table}: ${table.size} (${table.rowCount} rows)`);
        });
      }
    } finally {
      // Disable monitoring
      DatabaseMonitor.disableQueryMonitoring();
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const test = new PerformanceTest();

  test.runAll()
    .then(() => {
      console.log('\nPerformance tests completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Performance tests failed:', error);
      process.exit(1);
    });
}

export default PerformanceTest;
