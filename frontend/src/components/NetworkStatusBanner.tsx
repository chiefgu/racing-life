'use client';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export default function NetworkStatusBanner() {
  const { isOnline, isSlowConnection } = useNetworkStatus();

  if (isOnline && !isSlowConnection) {
    return null;
  }

  return (
    <div
      className={`fixed top-16 left-0 right-0 z-40 px-4 py-2 text-center text-sm font-medium ${
        !isOnline
          ? 'bg-red-600 text-white'
          : 'bg-yellow-500 text-gray-900'
      }`}
    >
      {!isOnline ? (
        <span>You are offline. Some features may not be available.</span>
      ) : (
        <span>Slow connection detected. Images and updates may load slower.</span>
      )}
    </div>
  );
}
