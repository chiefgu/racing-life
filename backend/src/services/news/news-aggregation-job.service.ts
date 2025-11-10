/**
 * News aggregation job service - schedules and manages news collection jobs
 */

import Bull, { Queue, Job } from 'bull';
import logger from '../../config/logger';
import { NewsAggregatorService } from './news-aggregator.service';
import { getEnabledSources, getSourceById } from '../../config/news-sources';
import type { NewsSource } from '../../types/news.types';

interface NewsAggregationJobData {
  sourceId?: string;
  timestamp: Date;
}

export class NewsAggregationJobService {
  private queue: Queue<NewsAggregationJobData>;
  private aggregator: NewsAggregatorService;
  private isInitialized = false;

  constructor(redisUrl?: string) {
    const redisConfig = redisUrl || process.env.REDIS_URL || 'redis://localhost:6379';
    
    this.queue = new Bull<NewsAggregationJobData>('news-aggregation', redisConfig, {
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });

    this.aggregator = new NewsAggregatorService();

    // Set up job processor
    this.queue.process(async (job: Job<NewsAggregationJobData>) => {
      return this.processJob(job);
    });

    // Set up event handlers
    this.setupEventHandlers();
  }

  /**
   * Initialize scheduled jobs for all enabled sources
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('News aggregation jobs already initialized');
      return;
    }

    logger.info('Initializing news aggregation jobs');

    // Clear existing jobs
    await this.queue.empty();
    const repeatableJobs = await this.queue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await this.queue.removeRepeatableByKey(job.key);
    }

    // Schedule jobs for each enabled source
    const sources = getEnabledSources();
    
    for (const source of sources) {
      await this.scheduleSourceJob(source);
    }

    // Also schedule a job to aggregate from all sources
    await this.scheduleAllSourcesJob();

    this.isInitialized = true;
    logger.info({ sourceCount: sources.length }, 'News aggregation jobs initialized');
  }

  /**
   * Schedule job for a specific source
   */
  async scheduleSourceJob(source: NewsSource): Promise<void> {
    const cronExpression = this.getCronExpression(source.pollInterval);
    
    await this.queue.add(
      { sourceId: source.id, timestamp: new Date() },
      {
        repeat: { cron: cronExpression },
        jobId: `source-${source.id}`,
      }
    );

    logger.info(
      { sourceId: source.id, interval: source.pollInterval, cron: cronExpression },
      'Scheduled news aggregation job for source'
    );
  }

  /**
   * Schedule job to aggregate from all sources
   */
  async scheduleAllSourcesJob(): Promise<void> {
    // Run every 30 minutes
    const cronExpression = '*/30 * * * *';
    
    await this.queue.add(
      { timestamp: new Date() },
      {
        repeat: { cron: cronExpression },
        jobId: 'all-sources',
      }
    );

    logger.info({ cron: cronExpression }, 'Scheduled aggregation job for all sources');
  }

  /**
   * Process a news aggregation job
   */
  private async processJob(job: Job<NewsAggregationJobData>): Promise<any> {
    const { sourceId } = job.data;

    try {
      if (sourceId) {
        // Aggregate from specific source
        const source = getSourceById(sourceId);
        if (!source) {
          throw new Error(`Source not found: ${sourceId}`);
        }

        if (!source.enabled) {
          logger.info({ sourceId }, 'Source is disabled, skipping');
          return { skipped: true, reason: 'disabled' };
        }

        logger.info({ sourceId, jobId: job.id }, 'Processing news aggregation job for source');
        const result = await this.aggregator.aggregateFromSource(source);
        
        logger.info(
          { sourceId, jobId: job.id, ...result },
          'Completed news aggregation job for source'
        );
        
        return result;
      } else {
        // Aggregate from all sources
        logger.info({ jobId: job.id }, 'Processing news aggregation job for all sources');
        const result = await this.aggregator.aggregateNews();
        
        logger.info(
          { jobId: job.id, ...result },
          'Completed news aggregation job for all sources'
        );
        
        return result;
      }
    } catch (error) {
      logger.error(
        {
          sourceId,
          jobId: job.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to process news aggregation job'
      );
      throw error;
    }
  }

  /**
   * Set up event handlers for the queue
   */
  private setupEventHandlers(): void {
    this.queue.on('completed', (job: Job, result: any) => {
      logger.debug(
        { jobId: job.id, sourceId: job.data.sourceId, result },
        'News aggregation job completed'
      );
    });

    this.queue.on('failed', (job: Job, error: Error) => {
      logger.error(
        {
          jobId: job.id,
          sourceId: job.data.sourceId,
          error: error.message,
          attempts: job.attemptsMade,
        },
        'News aggregation job failed'
      );
    });

    this.queue.on('stalled', (job: Job) => {
      logger.warn(
        { jobId: job.id, sourceId: job.data.sourceId },
        'News aggregation job stalled'
      );
    });

    this.queue.on('error', (error: Error) => {
      logger.error({ error: error.message }, 'News aggregation queue error');
    });
  }

  /**
   * Convert poll interval (minutes) to cron expression
   */
  private getCronExpression(intervalMinutes: number): string {
    if (intervalMinutes === 15) {
      return '*/15 * * * *'; // Every 15 minutes
    } else if (intervalMinutes === 20) {
      return '*/20 * * * *'; // Every 20 minutes
    } else if (intervalMinutes === 30) {
      return '*/30 * * * *'; // Every 30 minutes
    } else if (intervalMinutes === 60) {
      return '0 * * * *'; // Every hour
    } else {
      // Default: every N minutes (if supported)
      return `*/${intervalMinutes} * * * *`;
    }
  }

  /**
   * Manually trigger news aggregation for all sources
   */
  async triggerAggregation(): Promise<void> {
    logger.info('Manually triggering news aggregation');
    await this.queue.add({ timestamp: new Date() }, { priority: 1 });
  }

  /**
   * Manually trigger news aggregation for a specific source
   */
  async triggerSourceAggregation(sourceId: string): Promise<void> {
    logger.info({ sourceId }, 'Manually triggering news aggregation for source');
    await this.queue.add({ sourceId, timestamp: new Date() }, { priority: 1 });
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  /**
   * Pause job processing
   */
  async pause(): Promise<void> {
    await this.queue.pause();
    logger.info('News aggregation jobs paused');
  }

  /**
   * Resume job processing
   */
  async resume(): Promise<void> {
    await this.queue.resume();
    logger.info('News aggregation jobs resumed');
  }

  /**
   * Clean up and close queue
   */
  async close(): Promise<void> {
    await this.queue.close();
    logger.info('News aggregation queue closed');
  }
}
