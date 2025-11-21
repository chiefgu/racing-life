'use client';

import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Target } from 'lucide-react';

interface JockeyStatsWidgetProps {
  name: string;
  role: 'jockey' | 'trainer';
  todayRides?: number;
  season: {
    rides: number;
    wins: number;
    places: number;
    winRate: number;
    strikeRate: number;
  };
  track: {
    rides: number;
    wins: number;
    places: number;
    winRate: number;
  };
  recentForm: string; // e.g., "W-2-1-3-W"
  prizeMoney: string;
}

export default function JockeyStatsWidget({
  name,
  role,
  todayRides,
  season,
  track,
  recentForm,
  prizeMoney,
}: JockeyStatsWidgetProps) {
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
            <h4 className="font-bold text-sm sm:text-base truncate">{name}</h4>
            <p className="text-[10px] sm:text-xs text-white/80 truncate capitalize">
              {role} Statistics
              {todayRides && ` · ${todayRides} rides today`}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] sm:text-xs text-white/80">Win Rate</div>
            <div className="text-lg sm:text-2xl font-bold whitespace-nowrap">{season.winRate}%</div>
          </div>
        </div>
      </div>

      {/* Season Stats */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-1.5 mb-2">
          <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-primary" />
          <span className="text-[10px] sm:text-xs font-semibold text-gray-900">
            Season Performance
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-[10px] sm:text-xs text-gray-500 mb-1">Rides</div>
            <div className="text-base sm:text-lg font-bold text-gray-900">{season.rides}</div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-gray-500 mb-1">Wins</div>
            <div className="text-base sm:text-lg font-bold text-green-600">{season.wins}</div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-gray-500 mb-1">Places</div>
            <div className="text-base sm:text-lg font-bold text-blue-600">{season.places}</div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-gray-500 mb-1">Strike</div>
            <div className="text-base sm:text-lg font-bold text-gray-900">{season.strikeRate}%</div>
          </div>
        </div>
      </div>

      {/* Track Stats */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
        <div className="flex items-center gap-1.5 mb-2">
          <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-primary" />
          <span className="text-[10px] sm:text-xs font-semibold text-gray-900">This Track</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-600" style={{ width: `${track.winRate}%` }} />
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-green-600">
            {track.winRate}%
          </span>
        </div>
        <div className="text-[10px] sm:text-xs text-gray-600">
          {track.wins}-{track.places}-{track.rides - track.wins - track.places} ({track.rides}{' '}
          rides)
        </div>
      </div>

      {/* Recent Form */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-primary" />
          <span className="text-[10px] sm:text-xs font-semibold text-gray-900">Last 5 Rides</span>
        </div>
        <div className="flex items-center gap-1">
          {recentForm.split('-').map((pos, idx) => (
            <div
              key={idx}
              className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-[10px] sm:text-xs font-bold rounded ${
                pos === 'W' || pos === '1'
                  ? 'bg-yellow-400 text-gray-900'
                  : pos === '2' || pos === '3'
                    ? 'bg-blue-100 text-blue-900'
                    : 'bg-gray-100 text-gray-600'
              }`}
            >
              {pos}
            </div>
          ))}
        </div>
      </div>

      {/* Prize Money */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs text-gray-600">Season Prize Money</span>
          <span className="text-xs sm:text-sm font-bold text-gray-900">{prizeMoney}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-500 text-center border-t border-gray-200">
        Statistics updated daily
      </div>
    </motion.div>
  );
}
