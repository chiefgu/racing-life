'use client';

import { useState } from 'react';
import { Selection, Bookmaker } from '@/types';
import { formatOdds } from '@/lib/utils';
import { api } from '@/lib/api';

interface OddsTableMobileProps {
  raceId: string;
  selections: Selection[];
  bookmakers: Bookmaker[];
  connected: boolean;
  lastUpdate?: Date;
}

interface GroupedOdds {
  [horseName: string]: {
    horseNumber: number;
    odds: { [bookmaker: string]: number };
    bestOdds: number;
    bestBookmaker: string;
  };
}

export default function OddsTableMobile({
  raceId,
  selections,
  bookmakers,
  connected,
  lastUpdate,
}: OddsTableMobileProps) {
  const [trackingClick, setTrackingClick] = useState(false);
  const [expandedHorse, setExpandedHorse] = useState<string | null>(null);

  // Group odds by horse
  const groupedOdds: GroupedOdds = selections.reduce((acc, selection) => {
    if (!acc[selection.horseName]) {
      acc[selection.horseName] = {
        horseNumber: selection.horseNumber,
        odds: {},
        bestOdds: 0,
        bestBookmaker: '',
      };
    }

    acc[selection.horseName].odds[selection.bookmaker] = selection.winOdds;

    if (
      selection.winOdds > acc[selection.horseName].bestOdds ||
      acc[selection.horseName].bestOdds === 0
    ) {
      acc[selection.horseName].bestOdds = selection.winOdds;
      acc[selection.horseName].bestBookmaker = selection.bookmaker;
    }

    return acc;
  }, {} as GroupedOdds);

  const horses = Object.entries(groupedOdds).sort(
    (a, b) => a[1].horseNumber - b[1].horseNumber
  );

  const handleBookmakerClick = async (bookmaker: string) => {
    if (trackingClick) return;

    setTrackingClick(true);
    try {
      await api.trackClick({
        bookmaker,
        raceId,
      });

      const bookmakerData = bookmakers.find((b) => b.name === bookmaker);
      if (bookmakerData?.affiliateLink) {
        window.open(bookmakerData.affiliateLink, '_blank');
      }
    } catch (error) {
      console.error('Failed to track click:', error);
    } finally {
      setTrackingClick(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Status Bar */}
      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600 flex justify-between items-center border-b border-gray-200">
        <span className={`inline-flex items-center ${connected ? 'text-green-600' : 'text-gray-400'}`}>
          <span className={`w-2 h-2 rounded-full mr-1 ${connected ? 'bg-green-500' : 'bg-gray-400'}`}></span>
          {connected ? 'Live' : 'Offline'}
        </span>
        {lastUpdate && (
          <span className="text-gray-500">
            {new Date(lastUpdate).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Horse List */}
      <div className="divide-y divide-gray-200">
        {horses.map(([horseName, data]) => {
          const isExpanded = expandedHorse === horseName;
          
          return (
            <div key={horseName} className="bg-white">
              {/* Horse Header - Always Visible */}
              <button
                onClick={() => setExpandedHorse(isExpanded ? null : horseName)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-700">
                    {data.horseNumber}
                  </span>
                  <span className="font-medium text-gray-900 truncate">{horseName}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmakerClick(data.bestBookmaker);
                    }}
                    disabled={trackingClick}
                    className="px-3 py-1.5 rounded-md font-semibold bg-green-100 text-green-800 hover:bg-green-200 active:bg-green-300 transition-colors disabled:opacity-50"
                  >
                    {formatOdds(data.bestOdds)}
                  </button>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded Bookmaker Odds */}
              {isExpanded && (
                <div className="px-4 pb-3 bg-gray-50">
                  <div className="text-xs text-gray-600 mb-2 font-medium">All Bookmakers:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {bookmakers.map((bookmaker) => {
                      const odds = data.odds[bookmaker.name];
                      const isBest = bookmaker.name === data.bestBookmaker;

                      return (
                        <button
                          key={bookmaker.id}
                          onClick={() => odds && handleBookmakerClick(bookmaker.name)}
                          disabled={!odds || trackingClick}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            !odds
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : isBest
                              ? 'bg-green-100 text-green-800 hover:bg-green-200 active:bg-green-300'
                              : 'bg-white text-gray-800 hover:bg-gray-100 active:bg-gray-200 border border-gray-200'
                          }`}
                        >
                          <div className="text-xs text-gray-600 mb-0.5">{bookmaker.name}</div>
                          <div className="font-semibold">{odds ? formatOdds(odds) : '-'}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-3 text-xs text-gray-600 border-t border-gray-200">
        <div className="flex items-center">
          <span className="w-3 h-3 bg-green-100 rounded mr-2"></span>
          Best odds highlighted. Tap horse to see all bookmakers.
        </div>
      </div>
    </div>
  );
}
