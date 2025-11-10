import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { redisPub, redisSub } from './redis';
import logger from './logger';
import jwt from 'jsonwebtoken';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

let io: SocketIOServer | null = null;

/**
 * Initialize Socket.io server with Redis adapter for multi-server support
 */
export const initializeWebSocket = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Set up Redis adapter for multi-server coordination
  io.adapter(createAdapter(redisPub, redisSub));

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        // Allow anonymous connections but mark them as unauthenticated
        logger.info({ socketId: socket.id }, 'Anonymous WebSocket connection');
        return next();
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
        userId: string;
        role: string;
      };

      socket.userId = decoded.userId;
      socket.userRole = decoded.role;

      logger.info(
        { socketId: socket.id, userId: decoded.userId, role: decoded.role },
        'Authenticated WebSocket connection'
      );

      next();
    } catch (error) {
      logger.error({ error, socketId: socket.id }, 'WebSocket authentication failed');
      // Allow connection but without authentication
      next();
    }
  });

  // Connection handler
  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(
      {
        socketId: socket.id,
        userId: socket.userId,
        authenticated: !!socket.userId,
      },
      'Client connected to WebSocket'
    );

    // Set up race subscription handlers
    // Import dynamically to avoid circular dependency
    import('../services/websocket.service').then(({ WebSocketService }) => {
      WebSocketService.setupRaceSubscriptions(socket);
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(
        {
          socketId: socket.id,
          userId: socket.userId,
          reason,
        },
        'Client disconnected from WebSocket'
      );
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(
        {
          socketId: socket.id,
          userId: socket.userId,
          error,
        },
        'WebSocket error'
      );
    });
  });

  logger.info('WebSocket server initialized with Redis adapter');

  return io;
};

/**
 * Get the Socket.io server instance
 */
export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io server not initialized. Call initializeWebSocket first.');
  }
  return io;
};

/**
 * Broadcast odds update to all clients subscribed to a race
 */
export const broadcastOddsUpdate = (raceId: string, oddsData: any): void => {
  if (!io) {
    logger.warn('Cannot broadcast odds update: Socket.io not initialized');
    return;
  }

  io.to(`race:${raceId}`).emit('odds_update', {
    type: 'odds_update',
    raceId,
    payload: oddsData,
    timestamp: new Date().toISOString(),
  });

  logger.debug({ raceId }, 'Broadcasted odds update');
};

/**
 * Broadcast race status change
 */
export const broadcastRaceStatus = (raceId: string, status: string): void => {
  if (!io) {
    logger.warn('Cannot broadcast race status: Socket.io not initialized');
    return;
  }

  io.to(`race:${raceId}`).emit('race_status', {
    type: 'race_status',
    raceId,
    payload: { status },
    timestamp: new Date().toISOString(),
  });

  logger.debug({ raceId, status }, 'Broadcasted race status');
};

/**
 * Broadcast news update to all connected clients
 */
export const broadcastNewsUpdate = (newsData: any): void => {
  if (!io) {
    logger.warn('Cannot broadcast news update: Socket.io not initialized');
    return;
  }

  io.emit('news_update', {
    type: 'news_update',
    payload: newsData,
    timestamp: new Date().toISOString(),
  });

  logger.debug('Broadcasted news update');
};

/**
 * Get connection statistics
 */
export const getConnectionStats = (): { connected: number; rooms: string[] } => {
  if (!io) {
    return { connected: 0, rooms: [] };
  }

  const sockets = io.sockets.sockets;
  const rooms = Array.from(io.sockets.adapter.rooms.keys()).filter(
    (room) => !io!.sockets.sockets.has(room) // Filter out socket IDs (which are also rooms)
  );

  return {
    connected: sockets.size,
    rooms,
  };
};
