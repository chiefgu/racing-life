import admin from 'firebase-admin';
import { db } from '../db/knex';
import { logger } from '../config/logger';

// Initialize Firebase Admin SDK
let firebaseApp: admin.app.App | null = null;

export const initializeFirebase = () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : null;

    if (!serviceAccount) {
      logger.warn('Firebase service account not configured. Push notifications will be disabled.');
      return null;
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    logger.info('Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    logger.error({ error }, 'Failed to initialize Firebase Admin SDK');
    return null;
  }
};

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  data?: Record<string, string>;
}

export class PushNotificationService {
  private messaging: admin.messaging.Messaging | null = null;

  constructor() {
    const app = initializeFirebase();
    if (app) {
      this.messaging = admin.messaging(app);
    }
  }

  /**
   * Send push notification to a specific user
   */
  async sendToUser(userId: string, payload: PushNotificationPayload): Promise<void> {
    if (!this.messaging) {
      logger.warn('Firebase messaging not initialized. Skipping push notification.');
      return;
    }

    try {
      // Get user's FCM tokens
      const tokens = await db('user_fcm_tokens')
        .select('token')
        .where('user_id', userId)
        .where('last_used', '>', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)); // Active in last 90 days

      if (tokens.length === 0) {
        logger.info(`No active FCM tokens found for user ${userId}`);
        return;
      }

      const fcmTokens = tokens.map((t) => t.token);

      // Send notification
      const message: admin.messaging.MulticastMessage = {
        tokens: fcmTokens,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.icon,
        },
        data: {
          url: payload.url || '/',
          tag: payload.tag || 'default',
          ...payload.data,
        },
        webpush: {
          notification: {
            icon: payload.icon || '/icon-192x192.png',
            badge: payload.badge || '/icon-192x192.png',
            tag: payload.tag || 'default',
            requireInteraction: false,
          },
          fcmOptions: {
            link: payload.url || '/',
          },
        },
      };

      const response = await this.messaging.sendEachForMulticast(message);

      logger.info(`Push notification sent to user ${userId}. Success: ${response.successCount}, Failure: ${response.failureCount}`);

      // Remove invalid tokens
      if (response.failureCount > 0) {
        const invalidTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success && resp.error) {
            const errorCode = resp.error.code;
            if (
              errorCode === 'messaging/invalid-registration-token' ||
              errorCode === 'messaging/registration-token-not-registered'
            ) {
              invalidTokens.push(fcmTokens[idx]);
            }
          }
        });

        if (invalidTokens.length > 0) {
          await db('user_fcm_tokens')
            .whereIn('token', invalidTokens)
            .delete();
          logger.info(`Removed ${invalidTokens.length} invalid FCM tokens`);
        }
      }
    } catch (error) {
      logger.error({ error, userId }, `Failed to send push notification to user ${userId}`);
      throw error;
    }
  }

  /**
   * Send push notification to multiple users
   */
  async sendToUsers(userIds: string[], payload: PushNotificationPayload): Promise<void> {
    await Promise.all(userIds.map((userId) => this.sendToUser(userId, payload)));
  }

  /**
   * Send notification to users with specific watchlist items
   */
  async sendToWatchlistUsers(
    entityType: 'horse' | 'jockey' | 'trainer',
    entityName: string,
    payload: PushNotificationPayload
  ): Promise<void> {
    try {
      const watchlistItems = await db('watchlist_items')
        .select('user_id')
        .where('entity_type', entityType)
        .where('entity_name', entityName);

      const userIds = watchlistItems.map((item) => item.user_id);

      if (userIds.length > 0) {
        await this.sendToUsers(userIds, payload);
      }
    } catch (error) {
      logger.error({ error, entityType, entityName }, `Failed to send watchlist notification for ${entityType} ${entityName}`);
      throw error;
    }
  }

  /**
   * Send test notification
   */
  async sendTestNotification(userId: string): Promise<void> {
    await this.sendToUser(userId, {
      title: 'Test Notification',
      body: 'This is a test notification from The Paddock',
      tag: 'test',
      url: '/',
    });
  }
}

export const pushNotificationService = new PushNotificationService();
