'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';

interface OddsSnapshot {
  id?: string;
  raceId: string;
  horseId: string;
  bookmakerId: string;
  market: string;
  winOdds: number;
  placeOdds?: number;
  timestamp: Date;
  sourceType: 'api' | 'scraper';
}

interface OddsUpdatePayload {
  odds: OddsSnapshot[];
  updatedAt: string;
}

/**
 * Custom hook for subscribing to real-time race odds updates
 */
export const useRaceOdds = (raceId: string | null) => {
  const { connected, subscribeToRace, unsubscribeFromRace, onOddsUpdate } = useWebSocket();
  const [latestOdds, setLatestOdds] = useState<OddsSnapshot[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Subscribe to race when raceId changes
  useEffect(() => {
    if (!raceId || !connected) {
      setIsSubscribed(false);
      return;
    }

    console.log('Subscribing to race odds:', raceId);
    subscribeToRace(raceId);
    setIsSubscribed(true);

    // Cleanup: unsubscribe when component unmounts or raceId changes
    return () => {
      console.log('Unsubscribing from race odds:', raceId);
      unsubscribeFromRace(raceId);
      setIsSubscribed(false);
    };
  }, [raceId, connected, subscribeToRace, unsubscribeFromRace]);

  // Listen for odds updates
  useEffect(() => {
    if (!raceId) return;

    const cleanup = onOddsUpdate((data) => {
      // Only process updates for the subscribed race
      if (data.raceId === raceId) {
        console.log('Received odds update for race:', raceId, data);
        const payload = data.payload as OddsUpdatePayload;
        setLatestOdds(payload.odds);
        setLastUpdate(payload.updatedAt);
      }
    });

    return cleanup;
  }, [raceId, onOddsUpdate]);

  const refreshOdds = useCallback(() => {
    // Trigger a manual refresh by re-subscribing
    if (raceId && connected) {
      unsubscribeFromRace(raceId);
      setTimeout(() => {
        subscribeToRace(raceId);
      }, 100);
    }
  }, [raceId, connected, subscribeToRace, unsubscribeFromRace]);

  return {
    latestOdds,
    lastUpdate,
    isSubscribed,
    connected,
    refreshOdds,
  };
};

/**
 * Custom hook for subscribing to multiple races
 */
export const useMultipleRaceOdds = (raceIds: string[]) => {
  const { connected, subscribeToRaces, onOddsUpdate } = useWebSocket();
  const [oddsMap, setOddsMap] = useState<Map<string, OddsSnapshot[]>>(new Map());
  const [lastUpdateMap, setLastUpdateMap] = useState<Map<string, string>>(new Map());

  // Subscribe to all races
  useEffect(() => {
    if (raceIds.length === 0 || !connected) return;

    console.log('Subscribing to multiple races:', raceIds);
    subscribeToRaces(raceIds);

    // Note: Cleanup is handled by the WebSocket context
  }, [raceIds, connected, subscribeToRaces]);

  // Listen for odds updates
  useEffect(() => {
    const cleanup = onOddsUpdate((data) => {
      if (data.raceId && raceIds.includes(data.raceId)) {
        console.log('Received odds update for race:', data.raceId);
        const payload = data.payload as OddsUpdatePayload;
        
        setOddsMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(data.raceId!, payload.odds);
          return newMap;
        });

        setLastUpdateMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(data.raceId!, payload.updatedAt);
          return newMap;
        });
      }
    });

    return cleanup;
  }, [raceIds, onOddsUpdate]);

  return {
    oddsMap,
    lastUpdateMap,
    connected,
  };
};
