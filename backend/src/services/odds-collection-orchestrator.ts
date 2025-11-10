import { oddsCollectionJobService } from './odds-collection-job.service';
import { OddsCollectionJobData } from './odds-collection-job.service';

/**
 * Odds Collection Orchestrator
 * High-level service to manage odds collection workflows
 */

export class OddsCollectionOrchestrator {
  /**
   * Initialize periodic odds collection for horse racing
   */
  async initializeHorseRacingCollection(): Promise<void> {
    console.log('Initializing horse racing odds collection...');

    // Schedule periodic collection for Australian horse racing
    const jobData: OddsCollectionJobData = {
      sport: 'horse_racing_australia',
      region: 'au',
      markets: ['h2h', 'win', 'place'],
    };

    // Schedule collection every 60 seconds
    await oddsCollectionJobService.schedulePeriodicCollection(jobData, 60);

    console.log('Horse racing odds collection initialized');
  }

  /**
   * Collect odds for specific races immediately
   */
  async collectOddsForRaces(raceIds: string[]): Promise<void> {
    console.log(`Collecting odds for ${raceIds.length} races...`);

    const jobData: OddsCollectionJobData = {
      sport: 'horse_racing_australia',
      region: 'au',
      markets: ['h2h', 'win', 'place'],
      raceIds,
    };

    await oddsCollectionJobService.addOddsCollectionJob(jobData);

    console.log('Odds collection job queued');
  }

  /**
   * Get collection status
   */
  async getCollectionStatus(): Promise<{
    scheduled: number;
    active: number;
    waiting: number;
    failed: number;
  }> {
    const scheduled = await oddsCollectionJobService.getScheduledJobs();
    const stats = await oddsCollectionJobService.getQueueStats();

    return {
      scheduled: scheduled.length,
      active: stats.active,
      waiting: stats.waiting,
      failed: stats.failed,
    };
  }

  /**
   * Stop all odds collection
   */
  async stopAllCollection(): Promise<void> {
    console.log('Stopping all odds collection...');

    const scheduled = await oddsCollectionJobService.getScheduledJobs();
    
    for (const job of scheduled) {
      if (job.id) {
        await oddsCollectionJobService.removeScheduledJob(job.id);
      }
    }

    await oddsCollectionJobService.pauseQueue();

    console.log('All odds collection stopped');
  }

  /**
   * Resume odds collection
   */
  async resumeCollection(): Promise<void> {
    console.log('Resuming odds collection...');
    await oddsCollectionJobService.resumeQueue();
    console.log('Odds collection resumed');
  }
}

export const oddsCollectionOrchestrator = new OddsCollectionOrchestrator();
