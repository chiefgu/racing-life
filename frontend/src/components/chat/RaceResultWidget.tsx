'use client';

import { motion } from 'framer-motion';
import { Trophy, Clock, DollarSign } from 'lucide-react';

interface ResultHorse {
  position: number;
  horseName: string;
  horseNumber: number;
  jockey: string;
  barrier: number;
  margin: string;
  finalOdds: number;
  bestOddsBookmaker?: {
    name: string;
    logo: string;
    url: string;
  };
  time?: string;
}

interface RaceResultWidgetProps {
  race: string;
  track: string;
  distance: number;
  winners: ResultHorse[]; // Top 4 positions
  winningTime?: string;
  dividends?: {
    win?: number;
    place?: number[];
    quinella?: number;
    exacta?: number;
    trifecta?: number;
  };
}

export default function RaceResultWidget({
  race,
  track,
  distance,
  winners,
  winningTime,
  dividends,
}: RaceResultWidgetProps) {
  const getPositionColor = (position: number) => {
    if (position === 1) return 'bg-yellow-400 text-gray-900';
    if (position === 2) return 'bg-gray-300 text-gray-900';
    if (position === 3) return 'bg-orange-400 text-white';
    return 'bg-gray-100 text-gray-600';
  };

  const getPositionEmoji = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden my-3"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-primary-intense text-white px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <h4 className="font-bold text-sm sm:text-base truncate">Race Result</h4>
            </div>
            <p className="text-[10px] sm:text-xs text-white/80 truncate">
              {track} {race} · {distance}m
            </p>
          </div>
          {winningTime && (
            <div className="text-right flex-shrink-0">
              <div className="text-[10px] sm:text-xs text-white/80">Time</div>
              <div className="text-base sm:text-lg font-bold whitespace-nowrap">{winningTime}</div>
            </div>
          )}
        </div>
      </div>

      {/* Results List */}
      <div className="divide-y divide-gray-100">
        {winners.map((horse) => (
          <div
            key={horse.position}
            className={`px-3 sm:px-4 py-2 sm:py-3 ${horse.position === 1 ? 'bg-yellow-50' : ''}`}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Position Badge */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full font-bold text-xs sm:text-sm flex-shrink-0 ${getPositionColor(
                  horse.position
                )}`}
              >
                {horse.position}
              </div>

              {/* Horse Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm sm:text-base">
                        {getPositionEmoji(horse.position)}
                      </span>
                      <span className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                        {horse.horseName}
                      </span>
                      <span className="flex-shrink-0 text-[10px] sm:text-xs text-gray-500">
                        (#{horse.horseNumber})
                      </span>
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-600">
                      {horse.jockey} · Barrier {horse.barrier}
                      {horse.margin && ` · ${horse.margin}`}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xs sm:text-sm font-bold text-gray-900">
                      ${horse.finalOdds.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dividends */}
      {dividends && (
        <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-200">
          <div className="flex items-center gap-1.5 mb-2">
            <DollarSign className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-[10px] sm:text-xs font-semibold text-gray-900">Dividends</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {dividends.win && (
              <div className="flex justify-between">
                <span className="text-gray-600">Win:</span>
                <span className="font-bold text-gray-900">${dividends.win.toFixed(2)}</span>
              </div>
            )}
            {dividends.place && dividends.place.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Place:</span>
                <span className="font-bold text-gray-900">${dividends.place[0].toFixed(2)}</span>
              </div>
            )}
            {dividends.quinella && (
              <div className="flex justify-between">
                <span className="text-gray-600">Quinella:</span>
                <span className="font-bold text-gray-900">${dividends.quinella.toFixed(2)}</span>
              </div>
            )}
            {dividends.exacta && (
              <div className="flex justify-between">
                <span className="text-gray-600">Exacta:</span>
                <span className="font-bold text-gray-900">${dividends.exacta.toFixed(2)}</span>
              </div>
            )}
            {dividends.trifecta && (
              <div className="flex justify-between">
                <span className="text-gray-600">Trifecta:</span>
                <span className="font-bold text-gray-900">${dividends.trifecta.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-50 px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-500 text-center border-t border-gray-200">
        Official results · Dividends paid on $1 stake
      </div>
    </motion.div>
  );
}
