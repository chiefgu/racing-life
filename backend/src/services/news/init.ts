/**
 * Initialize news aggregation services
 */

import logger from '../../config/logger';
import { NewsAggregationJobService } from './news-aggregation-job.service';

let jobService: NewsAggregationJobService | null = null;

/**
 * Initialize news aggregation jobs
 */
export async function initializeNewsAggregation(): Promise<NewsAggregationJobService> {
  if (jobService) {
    logger.warn('News aggregation already initialized');
    return jobService;
  }

  try {
    logger.info('Initializing news aggregation service');
    
    jobService = new NewsAggregationJobService();
    await jobService.initialize();
    
    logger.info('News aggregation service initialized successfully');
    
    return jobService;
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to initialize news aggregation service'
    );
    throw error;
  }
}

/**
 * Get the news aggregation job service instance
 */
export function getNewsAggregationJobService(): NewsAggregationJobService | null {
  return jobService;
}

/**
 * Shutdown news aggregation service
 */
export async function shutdownNewsAggregation(): Promise<void> {
  if (jobService) {
    logger.info('Shutting down news aggregation service');
    await jobService.close();
    jobService = null;
  }
}
