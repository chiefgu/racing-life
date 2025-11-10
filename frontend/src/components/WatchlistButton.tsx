'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface WatchlistButtonProps {
  entityType: 'horse' | 'jockey' | 'trainer' | 'meeting';
  entityName: string;
  className?: string;
}

export default function WatchlistButton({ entityType, entityName, className = '' }: WatchlistButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [watchlistId, setWatchlistId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      checkWatchlistStatus();
    }
  }, [isAuthenticated, entityType, entityName]);

  const checkWatchlistStatus = async () => {
    try {
      const response: any = await api.getWatchlist();
      const items = response.data.items || [];
      const item = items.find(
        (i: any) => i.entity_type === entityType && i.entity_name === entityName
      );
      if (item) {
        setIsInWatchlist(true);
        setWatchlistId(item.id);
      } else {
        setIsInWatchlist(false);
        setWatchlistId(null);
      }
    } catch (err) {
      // Silently fail
    }
  };

  const handleToggle = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    setIsLoading(true);

    try {
      if (isInWatchlist && watchlistId) {
        await api.removeFromWatchlist(watchlistId);
        setIsInWatchlist(false);
        setWatchlistId(null);
      } else {
        const response: any = await api.addToWatchlist(entityType, entityName);
        setIsInWatchlist(true);
        setWatchlistId(response.data.item.id);
      }
    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
        isInWatchlist
          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      <svg
        className="w-4 h-4"
        fill={isInWatchlist ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
      {isInWatchlist ? 'Watching' : 'Watch'}
    </button>
  );
}
