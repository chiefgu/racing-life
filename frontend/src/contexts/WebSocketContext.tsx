'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketMessage {
  type: string;
  raceId?: string;
  payload: any;
  timestamp: string;
}

interface WebSocketContextType {
  socket: Socket | null;
  connected: boolean;
  subscribeToRace: (raceId: string) => void;
  unsubscribeFromRace: (raceId: string) => void;
  subscribeToRaces: (raceIds: string[]) => void;
  onOddsUpdate: (callback: (data: WebSocketMessage) => void) => () => void;
  onRaceStatus: (callback: (data: WebSocketMessage) => void) => () => void;
  onNewsUpdate: (callback: (data: WebSocketMessage) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Get backend URL from environment or default
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

    // Get auth token from localStorage if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // Initialize socket connection
    const newSocket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      auth: {
        token: token || undefined,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 3,
      autoConnect: false, // Don't auto-connect, we'll do it manually
    });

    // Only try to connect if we're in development or have a backend URL configured
    if (process.env.NODE_ENV === 'development' && backendUrl.includes('localhost')) {
      // Try to connect, but don't spam errors
      newSocket.connect();
    }

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('WebSocket connected:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setConnected(false);
    });

    newSocket.on('connect_error', (_error) => {
      // Silently fail - WebSocket is optional for now
      setConnected(false);
    });

    newSocket.on('error', (_error) => {
      // Silently fail - WebSocket is optional for now
    });

    // Handle subscription confirmations
    newSocket.on('subscribed', (data) => {
      console.log('Subscribed:', data);
    });

    newSocket.on('unsubscribed', (data) => {
      console.log('Unsubscribed:', data);
    });

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up WebSocket connection');
      newSocket.close();
      socketRef.current = null;
    };
  }, []);

  const subscribeToRace = useCallback((raceId: string) => {
    if (socketRef.current?.connected) {
      console.log('Subscribing to race:', raceId);
      socketRef.current.emit('subscribe_race', { raceId });
    } else {
      console.warn('Cannot subscribe: socket not connected');
    }
  }, []);

  const unsubscribeFromRace = useCallback((raceId: string) => {
    if (socketRef.current?.connected) {
      console.log('Unsubscribing from race:', raceId);
      socketRef.current.emit('unsubscribe_race', { raceId });
    }
  }, []);

  const subscribeToRaces = useCallback((raceIds: string[]) => {
    if (socketRef.current?.connected) {
      console.log('Subscribing to races:', raceIds);
      socketRef.current.emit('subscribe_races', { raceIds });
    } else {
      console.warn('Cannot subscribe: socket not connected');
    }
  }, []);

  const onOddsUpdate = useCallback((callback: (data: WebSocketMessage) => void) => {
    if (!socketRef.current) return () => {};

    const handler = (data: WebSocketMessage) => {
      callback(data);
    };

    socketRef.current.on('odds_update', handler);

    // Return cleanup function
    return () => {
      socketRef.current?.off('odds_update', handler);
    };
  }, []);

  const onRaceStatus = useCallback((callback: (data: WebSocketMessage) => void) => {
    if (!socketRef.current) return () => {};

    const handler = (data: WebSocketMessage) => {
      callback(data);
    };

    socketRef.current.on('race_status', handler);

    return () => {
      socketRef.current?.off('race_status', handler);
    };
  }, []);

  const onNewsUpdate = useCallback((callback: (data: WebSocketMessage) => void) => {
    if (!socketRef.current) return () => {};

    const handler = (data: WebSocketMessage) => {
      callback(data);
    };

    socketRef.current.on('news_update', handler);

    return () => {
      socketRef.current?.off('news_update', handler);
    };
  }, []);

  const value: WebSocketContextType = {
    socket,
    connected,
    subscribeToRace,
    unsubscribeFromRace,
    subscribeToRaces,
    onOddsUpdate,
    onRaceStatus,
    onNewsUpdate,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};
