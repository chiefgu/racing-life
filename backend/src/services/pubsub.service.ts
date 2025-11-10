import { redisPub, redisSub, CacheKeys } from '../config/redis';

/**
 * PubSub Service for WebSocket coordination
 * Enables real-time updates across multiple server instances
 */
export class PubSubService {
  private subscribers: Map<string, Set<(message: any) => void>> = new Map();

  constructor() {
    // Handle incoming messages
    redisSub.on('message', (channel: string, message: string) => {
      this.handleMessage(channel, message);
    });
  }

  /**
   * Publish message to channel
   */
  async publish(channel: string, message: any): Promise<number> {
    try {
      const serialized = JSON.stringify(message);
      const receivers = await redisPub.publish(channel, serialized);
      return receivers;
    } catch (error) {
      console.error(`PubSub publish error for channel ${channel}:`, error);
      return 0;
    }
  }

  /**
   * Subscribe to channel
   */
  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    try {
      // Add callback to local subscribers
      if (!this.subscribers.has(channel)) {
        this.subscribers.set(channel, new Set());
        // Subscribe to Redis channel
        await redisSub.subscribe(channel);
      }
      this.subscribers.get(channel)!.add(callback);
    } catch (error) {
      console.error(`PubSub subscribe error for channel ${channel}:`, error);
    }
  }

  /**
   * Unsubscribe from channel
   */
  async unsubscribe(channel: string, callback?: (message: any) => void): Promise<void> {
    try {
      const channelSubscribers = this.subscribers.get(channel);
      if (!channelSubscribers) return;

      if (callback) {
        channelSubscribers.delete(callback);
      }

      // If no more subscribers, unsubscribe from Redis
      if (!callback || channelSubscribers.size === 0) {
        this.subscribers.delete(channel);
        await redisSub.unsubscribe(channel);
      }
    } catch (error) {
      console.error(`PubSub unsubscribe error for channel ${channel}:`, error);
    }
  }

  /**
   * Handle incoming message
   */
  private handleMessage(channel: string, message: string): void {
    try {
      const parsed = JSON.parse(message);
      const channelSubscribers = this.subscribers.get(channel);
      
      if (channelSubscribers) {
        channelSubscribers.forEach(callback => {
          try {
            callback(parsed);
          } catch (error) {
            console.error('Error in subscriber callback:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error handling pubsub message:', error);
    }
  }

  /**
   * Publish odds update
   */
  async publishOddsUpdate(raceId: string, odds: any): Promise<number> {
    const channel = CacheKeys.pubsub.oddsUpdate(raceId);
    return this.publish(channel, {
      type: 'odds_update',
      raceId,
      odds,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Subscribe to odds updates for a race
   */
  async subscribeToOddsUpdates(
    raceId: string,
    callback: (data: any) => void
  ): Promise<void> {
    const channel = CacheKeys.pubsub.oddsUpdate(raceId);
    await this.subscribe(channel, callback);
  }

  /**
   * Unsubscribe from odds updates
   */
  async unsubscribeFromOddsUpdates(
    raceId: string,
    callback?: (data: any) => void
  ): Promise<void> {
    const channel = CacheKeys.pubsub.oddsUpdate(raceId);
    await this.unsubscribe(channel, callback);
  }

  /**
   * Publish race status update
   */
  async publishRaceStatusUpdate(raceId: string, status: string): Promise<number> {
    const channel = CacheKeys.pubsub.raceStatus(raceId);
    return this.publish(channel, {
      type: 'race_status',
      raceId,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Subscribe to race status updates
   */
  async subscribeToRaceStatus(
    raceId: string,
    callback: (data: any) => void
  ): Promise<void> {
    const channel = CacheKeys.pubsub.raceStatus(raceId);
    await this.subscribe(channel, callback);
  }

  /**
   * Publish news update
   */
  async publishNewsUpdate(article: any): Promise<number> {
    const channel = CacheKeys.pubsub.newsUpdate();
    return this.publish(channel, {
      type: 'news_update',
      article,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Subscribe to news updates
   */
  async subscribeToNewsUpdates(callback: (data: any) => void): Promise<void> {
    const channel = CacheKeys.pubsub.newsUpdate();
    await this.subscribe(channel, callback);
  }

  /**
   * Get active subscriptions count
   */
  getSubscriptionsCount(): number {
    return this.subscribers.size;
  }

  /**
   * Get all active channels
   */
  getActiveChannels(): string[] {
    return Array.from(this.subscribers.keys());
  }
}

export const pubSubService = new PubSubService();
