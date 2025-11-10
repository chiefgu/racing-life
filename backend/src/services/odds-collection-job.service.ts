import Bull, { Queue, Job, JobOptions } from 'bull';
import { bookmakerManager } from './bookmaker/bookmaker-manager';
import { oddsNormalizer } from './bookmaker/odds-normalizer';
import { oddsProcessorService } from './odds-processor.service';
import { oddsValidatorService } from './odds-validator.service';
import { oddsStorageService } from './odds-storage.service';
import { OddsRequest } from '../types/bookmaker.types';
import { logOddsCollection } from '../config/logger';

/**
 * Odds Collection Job Service
 * Manages scheduled odds collection using Bull queue
 */

export interface OddsCollectionJobData {
  bookmakers?: string[];
  sport: string;
  region: string;
  markets?: string[];
  raceIds?: string[];
}

export interface OddsCollectionResult {
  success: boolean;
  bookmaker: string;
  oddsCollected: number;
  oddsStored: number;
  errors: string[];
  duration: number;
}

export class OddsCollectionJobService {
  private queue: Queue<OddsCollectionJobData>;
  private readonly QUEUE_NAME = 'odds-collection';
  private readonly DEFAULT_JOB_OPTIONS: JobOptions = {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  };

  constructor(redisUrl?: string) {
    // Initialize Bull queue with Redis connection
    this.queue = new Bull<OddsCollectionJobData>(this.QUEUE_NAME, {
      redis: redisUrl || process.env.REDIS_URL || 'redis://localhost:6379',
      defaultJobOptions: this.DEFAULT_JOB_OPTIONS,
    });

    // Set up job processor
    this.setupProcessor();

    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Set up job processor
   */
  private setupProcessor(): void {
    this.queue.process(async (job: Job<OddsCollectionJobData>) => {
      return await this.processOddsCollection(job);
    });
  }

  /**
   * Set up event listeners for monitoring
   */
  private setupEventListeners(): void {
    this.queue.on('completed', (job, result) => {
      console.log(`Job ${job.id} completed:`, result);
    });

    this.queue.on('failed', (job, err) => {
      console.error(`Job ${job?.id} failed:`, err.message);
    });

    this.queue.on('stalled', (job) => {
      console.warn(`Job ${job.id} stalled`);
    });

    this.queue.on('error', (error) => {
      console.error('Queue error:', error);
    });
  }

  /**
   * Process odds collection job
   */
  private async processOddsCollection(
    job: Job<OddsCollectionJobData>
  ): Promise<OddsCollectionResult[]> {
    const startTime = Date.now();
    const { bookmakers, sport, region, markets, raceIds } = job.data;

    console.log(`Processing odds collection job ${job.id}`, job.data);

    const results: OddsCollectionResult[] = [];

    // Get bookmakers to fetch from
    const targetBookmakers = bookmakers || 
      bookmakerManager.getActiveClients().map(c => c.getName());

    // Fetch odds from each bookmaker
    for (const bookmakerName of targetBookmakers) {
      const bookmakerStartTime = Date.now();
      const errors: string[] = [];

      try {
        // Prepare odds request
        const request: OddsRequest = {
          sport,
          region,
          markets,
          oddsFormat: 'decimal',
          dateFormat: 'iso',
        };

        // Fetch odds from bookmaker
        const response = await bookmakerManager.fetchOddsFromBookmaker(
          bookmakerName,
          request
        );

        if (!response.success || !response.data) {
          errors.push(response.error?.message || 'Failed to fetch odds');
          results.push({
            success: false,
            bookmaker: bookmakerName,
            oddsCollected: 0,
            oddsStored: 0,
            errors,
            duration: Date.now() - bookmakerStartTime,
          });
          continue;
        }

        // Normalize odds from all events
        let allNormalizedOdds = [];
        for (const event of response.data.events) {
          const normalized = oddsNormalizer.normalizeOddsApiEvent(
            event,
            event.id
          );
          allNormalizedOdds.push(...normalized);
        }

        // Filter by race IDs if specified
        if (raceIds && raceIds.length > 0) {
          allNormalizedOdds = allNormalizedOdds.filter(odds =>
            raceIds.includes(odds.raceId)
          );
        }

        // Process odds (match to database entities)
        const processedOdds = await oddsProcessorService.processOdds(
          allNormalizedOdds
        );

        // Validate odds
        const validationResults = await oddsValidatorService.batchValidate(
          processedOdds
        );

        // Filter valid odds
        const validOdds = oddsValidatorService.filterValidOdds(
          processedOdds,
          validationResults
        );

        // Detect anomalies
        const anomalies = await oddsValidatorService.batchDetectAnomalies(
          validOdds
        );

        // Log anomalies
        if (anomalies.size > 0) {
          console.warn(`Detected ${anomalies.size} anomalous odds changes`);
          anomalies.forEach((anomaly, key) => {
            if (anomaly.severity === 'high') {
              console.warn(`High severity anomaly: ${key}`, anomaly);
            }
          });
        }

        // Deduplicate odds
        const deduplicatedOdds = await oddsProcessorService.detectDuplicates(
          validOdds
        );

        // Store odds in database
        const storedCount = await oddsStorageService.storeOddsSnapshots(
          deduplicatedOdds
        );

        const duration = Date.now() - bookmakerStartTime;
        
        // Log successful odds collection
        logOddsCollection(bookmakerName, storedCount, true, duration);
        
        results.push({
          success: true,
          bookmaker: bookmakerName,
          oddsCollected: allNormalizedOdds.length,
          oddsStored: storedCount,
          errors,
          duration,
        });

      } catch (error: any) {
        console.error(`Error collecting odds from ${bookmakerName}:`, error);
        errors.push(error.message);
        
        const duration = Date.now() - bookmakerStartTime;
        
        // Log failed odds collection
        logOddsCollection(bookmakerName, 0, false, duration, error.message);
        
        results.push({
          success: false,
          bookmaker: bookmakerName,
          oddsCollected: 0,
          oddsStored: 0,
          errors,
          duration,
        });
      }
    }

    const totalDuration = Date.now() - startTime;
    console.log(`Odds collection job ${job.id} completed in ${totalDuration}ms`);

    return results;
  }

  /**
   * Schedule periodic odds collection
   */
  async schedulePeriodicCollection(
    jobData: OddsCollectionJobData,
    intervalSeconds: number = 60
  ): Promise<Bull.JobId> {
    // Add repeatable job
    const job = await this.queue.add(jobData, {
      repeat: {
        every: intervalSeconds * 1000,
      },
      jobId: `periodic-${jobData.sport}-${jobData.region}`,
    });

    console.log(`Scheduled periodic odds collection every ${intervalSeconds}s`);
    return job.id;
  }

  /**
   * Add one-time odds collection job
   */
  async addOddsCollectionJob(
    jobData: OddsCollectionJobData,
    options?: JobOptions
  ): Promise<Job<OddsCollectionJobData>> {
    return await this.queue.add(jobData, {
      ...this.DEFAULT_JOB_OPTIONS,
      ...options,
    });
  }

  /**
   * Remove scheduled job
   */
  async removeScheduledJob(jobId: string): Promise<void> {
    const repeatableJobs = await this.queue.getRepeatableJobs();
    const job = repeatableJobs.find(j => j.id === jobId);
    
    if (job) {
      await this.queue.removeRepeatableByKey(job.key);
      console.log(`Removed scheduled job: ${jobId}`);
    }
  }

  /**
   * Get all scheduled jobs
   */
  async getScheduledJobs(): Promise<Bull.JobInformation[]> {
    return await this.queue.getRepeatableJobs();
  }

  /**
   * Get job by ID
   */
  async getJob(jobId: Bull.JobId): Promise<Job<OddsCollectionJobData> | null> {
    return await this.queue.getJob(jobId);
  }

  /**
   * Get active jobs
   */
  async getActiveJobs(): Promise<Job<OddsCollectionJobData>[]> {
    return await this.queue.getActive();
  }

  /**
   * Get waiting jobs
   */
  async getWaitingJobs(): Promise<Job<OddsCollectionJobData>[]> {
    return await this.queue.getWaiting();
  }

  /**
   * Get failed jobs
   */
  async getFailedJobs(): Promise<Job<OddsCollectionJobData>[]> {
    return await this.queue.getFailed();
  }

  /**
   * Get completed jobs
   */
  async getCompletedJobs(): Promise<Job<OddsCollectionJobData>[]> {
    return await this.queue.getCompleted();
  }

  /**
   * Retry failed job
   */
  async retryFailedJob(jobId: Bull.JobId): Promise<void> {
    const job = await this.queue.getJob(jobId);
    if (job) {
      await job.retry();
      console.log(`Retrying job: ${jobId}`);
    }
  }

  /**
   * Clean old jobs
   */
  async cleanOldJobs(
    grace: number = 24 * 60 * 60 * 1000, // 24 hours
    status: 'completed' | 'failed' = 'completed'
  ): Promise<void> {
    await this.queue.clean(grace, status);
    console.log(`Cleaned ${status} jobs older than ${grace}ms`);
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const counts = await this.queue.getJobCounts();
    return {
      waiting: counts.waiting,
      active: counts.active,
      completed: counts.completed,
      failed: counts.failed,
      delayed: counts.delayed,
    };
  }

  /**
   * Pause queue
   */
  async pauseQueue(): Promise<void> {
    await this.queue.pause();
    console.log('Queue paused');
  }

  /**
   * Resume queue
   */
  async resumeQueue(): Promise<void> {
    await this.queue.resume();
    console.log('Queue resumed');
  }

  /**
   * Close queue connection
   */
  async close(): Promise<void> {
    await this.queue.close();
    console.log('Queue closed');
  }

  /**
   * Get queue instance (for advanced usage)
   */
  getQueue(): Queue<OddsCollectionJobData> {
    return this.queue;
  }
}

// Singleton instance
export const oddsCollectionJobService = new OddsCollectionJobService();
