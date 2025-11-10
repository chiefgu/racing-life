'use client';

import { useWebSocket } from '@/contexts/WebSocketContext';

/**
 * Simple component to display WebSocket connection status
 * Can be added to the header or footer for debugging
 */
export default function WebSocketStatus() {
  const { connected } = useWebSocket();

  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={`w-2 h-2 rounded-full ${
          connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`}
      ></span>
      <span className={connected ? 'text-green-600' : 'text-red-600'}>
        {connected ? 'Live' : 'Disconnected'}
      </span>
    </div>
  );
}
