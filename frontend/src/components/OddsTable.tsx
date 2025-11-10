'use client';

import { useState, useEffect } from 'react';
import { Selection, Bookmaker } from '@/types';
import { formatOdds } from '@/lib/utils';
import { api } from '@/lib/api';
import { useRaceOdds } from '@/hooks/useRaceOdds';
import OddsTableMobile from './OddsTableMobile';

interface OddsTableProps {
  raceId: string;
  selections: Selection[];
  bookmakers: Bookmaker[];
}

interface GroupedOdds {
  [horseName: string]: {
    horseNumber: number;
    odds: { [bookmaker: string]: number };
    bestOdds: number;
    bestBookmaker: string;
  };
}

export default function OddsTable({ raceId, selections, bookmakers }: OddsTableProps) {
  const [trackingClick, setTrackingClick] = useState(false);
  const [currentSelections, setCurrentSelections] = useState<Selection[]>(selections);
  
  // Subscribe to real-time odds updates
  const { latestOdds, lastUpdate, connected } = useRaceOdds(raceId);

  // Update selections when real-time data arrives
  useEffect(() => {
    if (latestOdds && latestOdds.length > 0) {
      // Merge with existing selections to preserve horse names and numbers
      setCurrentSelections((prev) => {
        const merged = [...prev];
        
        latestOdds.forEach((oddsSnapshot) => {
          // Find existing selection for this horse/bookmaker
          // Note: This is a simplified matching - in production you'd match by IDs
          const existingIndex = merged.findIndex(
            (s) => s.horseName && s.bookmaker // Match by IDs if available
          );

          if (existingIndex >= 0) {
            // Update existing selection with new odds
            merged[existingIndex] = {
              ...merged[existingIndex],
              winOdds: oddsSnapshot.winOdds,
              placeOdds: oddsSnapshot.placeOdds,
              lastUpdated: new Date(oddsSnapshot.timestamp).toISOString(),
            };
          }
        });

        return merged;
      });
    }
  }, [latestOdds]);

  // Reset to initial selections when prop changes
  useEffect(() => {
    setCurrentSelections(selections);
  }, [selections]);

  // Group odds by horse
  const groupedOdds: GroupedOdds = currentSelections.reduce((acc, selection) => {
    if (!acc[selection.horseName]) {
      acc[selection.horseName] = {
        horseNumber: selection.horseNumber,
        odds: {},
        bestOdds: 0,
        bestBookmaker: '',
      };
    }

    acc[selection.horseName].odds[selection.bookmaker] = selection.winOdds;

    // Track best odds
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

      // Find bookmaker affiliate link
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
    <>
      {/* Mobile View */}
      <div className="md:hidden">
        <OddsTableMobile
          raceId={raceId}
          selections={currentSelections}
          bookmakers={bookmakers}
          connected={connected}
          lastUpdate={lastUpdate ? new Date(lastUpdate) : undefined}
        />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-12 bg-gray-50 z-10">
                  Horse
                </th>
                {bookmakers.map((bookmaker) => (
                  <th
                    key={bookmaker.id}
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {bookmaker.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {horses.map(([horseName, data]) => (
                <tr key={horseName} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                    {data.horseNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-12 bg-white">
                    {horseName}
                  </td>
                  {bookmakers.map((bookmaker) => {
                    const odds = data.odds[bookmaker.name];
                    const isBest = bookmaker.name === data.bestBookmaker;

                    return (
                      <td key={bookmaker.id} className="px-6 py-4 whitespace-nowrap text-center">
                        {odds ? (
                          <button
                            onClick={() => handleBookmakerClick(bookmaker.name)}
                            disabled={trackingClick}
                            className={`px-3 py-1 rounded font-semibold transition-colors ${
                              isBest
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            } ${trackingClick ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {formatOdds(odds)}
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-6 py-3 text-xs text-gray-600 flex justify-between items-center">
          <span className="inline-flex items-center">
            <span className="w-3 h-3 bg-green-100 rounded mr-2"></span>
            Best available odds highlighted in green
          </span>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center ${connected ? 'text-green-600' : 'text-gray-400'}`}>
              <span className={`w-2 h-2 rounded-full mr-1 ${connected ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              {connected ? 'Live' : 'Offline'}
            </span>
            {lastUpdate && (
              <span className="text-gray-500">
                Updated: {new Date(lastUpdate).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
