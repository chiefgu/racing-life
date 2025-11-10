import { AuthenticatedSocket, getIO } from '../config/websocket';
import logger from '../config/logger';

/**
 * WebSocket service for managing race subscriptions and real-time updates
 */
export class WebSocketService {
  /**
   * Set up race subscription handlers for a socket
   */
  static setupRaceSubscriptions(socket: AuthenticatedSocket): void {
    // Subscribe to race odds updates
    socket.on('subscribe_race', (data: { raceId: string }) => {
      const { raceId } = data;

      if (!raceId) {
        socket.emit('error', {
          type: 'subscription_error',
          message: 'Race ID is required',
        });
        return;
      }

      const roomName = `race:${raceId}`;
      socket.join(roomName);

      logger.info(
        {
          socketId: socket.id,
          userId: socket.userId,
          raceId,
          roomName,
        },
        'Client subscribed to race'
      );

      socket.emit('subscribed', {
        type: 'subscribed',
        raceId,
        message: `Subscribed to race ${raceId}`,
      });
    });

    // Unsubscribe from race odds updates
    socket.on('unsubscribe_race', (data: { raceId: string }) => {
      const { raceId } = data;

      if (!raceId) {
        socket.emit('error', {
          type: 'subscription_error',
          message: 'Race ID is required',
        });
        return;
      }

      const roomName = `race:${raceId}`;
      socket.leave(roomName);

      logger.info(
        {
          socketId: socket.id,
          userId: socket.userId,
          raceId,
          roomName,
        },
        'Client unsubscribed from race'
      );

      socket.emit('unsubscribed', {
        type: 'unsubscribed',
        raceId,
        message: `Unsubscribed from race ${raceId}`,
      });
    });

    // Subscribe to multiple races at once
    socket.on('subscribe_races', (data: { raceIds: string[] }) => {
      const { raceIds } = data;

      if (!Array.isArray(raceIds) || raceIds.length === 0) {
        socket.emit('error', {
          type: 'subscription_error',
          message: 'Race IDs array is required',
        });
        return;
      }

      const subscribed: string[] = [];

      raceIds.forEach((raceId) => {
        if (raceId) {
          const roomName = `race:${raceId}`;
          socket.join(roomName);
          subscribed.push(raceId);
        }
      });

      logger.info(
        {
          socketId: socket.id,
          userId: socket.userId,
          raceIds: subscribed,
        },
        'Client subscribed to multiple races'
      );

      socket.emit('subscribed', {
        type: 'subscribed',
        raceIds: subscribed,
        message: `Subscribed to ${subscribed.length} races`,
      });
    });

    // Get list of subscribed races
    socket.on('get_subscriptions', () => {
      const rooms = Array.from(socket.rooms).filter((room) => room.startsWith('race:'));
      const raceIds = rooms.map((room) => room.replace('race:', ''));

      socket.emit('subscriptions', {
        type: 'subscriptions',
        raceIds,
      });
    });

    // Ping/pong for connection health check
    socket.on('ping', () => {
      socket.emit('pong', {
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * Broadcast odds update to all clients subscribed to a race
   */
  static broadcastOddsUpdate(raceId: string, oddsData: any): void {
    const io = getIO();
    const roomName = `race:${raceId}`;

    io.to(roomName).emit('odds_update', {
      type: 'odds_update',
      raceId,
      payload: oddsData,
      timestamp: new Date().toISOString(),
    });

    logger.debug({ raceId, roomName }, 'Broadcasted odds update to room');
  }

  /**
   * Broadcast race status change
   */
  static broadcastRaceStatus(raceId: string, status: string, additionalData?: any): void {
    const io = getIO();
    const roomName = `race:${raceId}`;

    io.to(roomName).emit('race_status', {
      type: 'race_status',
      raceId,
      payload: {
        status,
        ...additionalData,
      },
      timestamp: new Date().toISOString(),
    });

    logger.debug({ raceId, status, roomName }, 'Broadcasted race status to room');
  }

  /**
   * Broadcast news update to all connected clients
   */
  static broadcastNewsUpdate(newsData: any): void {
    const io = getIO();

    io.emit('news_update', {
      type: 'news_update',
      payload: newsData,
      timestamp: new Date().toISOString(),
    });

    logger.debug('Broadcasted news update to all clients');
  }

  /**
   * Send personalized notification to a specific user
   */
  static sendUserNotification(userId: string, notification: any): void {
    const io = getIO();
    const sockets = io.sockets.sockets;

    // Find all sockets for this user
    let sentCount = 0;
    sockets.forEach((socket: AuthenticatedSocket) => {
      if (socket.userId === userId) {
        socket.emit('notification', {
          type: 'notification',
          payload: notification,
          timestamp: new Date().toISOString(),
        });
        sentCount++;
      }
    });

    logger.debug({ userId, sentCount }, 'Sent notification to user');
  }

  /**
   * Get statistics about active subscriptions
   */
  static getSubscriptionStats(): {
    totalConnections: number;
    totalRooms: number;
    raceRooms: string[];
  } {
    const io = getIO();
    const rooms = Array.from(io.sockets.adapter.rooms.keys());
    const raceRooms = rooms.filter((room) => room.startsWith('race:'));

    return {
      totalConnections: io.sockets.sockets.size,
      totalRooms: rooms.length,
      raceRooms,
    };
  }
}
