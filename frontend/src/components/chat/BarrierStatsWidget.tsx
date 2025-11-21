'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp } from 'lucide-react';

interface BarrierStat {
  barrier: number;
  wins: number;
  places: number;
  starts: number;
  winRate: number;
  placeRate: number;
}

interface BarrierStatsWidgetProps {
  track: string;
  distance: number;
  sampleSize: number;
  barrierStats: BarrierStat[];
  bestBarriers: number[];
  worstBarriers: number[];
}

export default function BarrierStatsWidget({
  track,
  distance,
  sampleSize,
  barrierStats,
  bestBarriers,
  worstBarriers,
}: BarrierStatsWidgetProps) {
  const maxWinRate = Math.max(...barrierStats.map((b) => b.winRate));

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
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <h4 className="font-bold text-sm sm:text-base truncate">Barrier Statistics</h4>
            </div>
            <p className="text-[10px] sm:text-xs text-white/80 truncate">
              {track} · {distance}m
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] sm:text-xs text-white/80">Races</div>
            <div className="text-lg sm:text-2xl font-bold whitespace-nowrap">{sampleSize}</div>
          </div>
        </div>
      </div>

      {/* Best/Worst Summary */}
      <div className="grid grid-cols-2 gap-px bg-gray-200">
        <div className="bg-green-50 px-3 py-2 sm:py-3">
          <div className="text-[10px] sm:text-xs text-green-700 font-medium mb-1">
            Best Barriers
          </div>
          <div className="flex items-center gap-1">
            {bestBarriers.map((b, idx) => (
              <div
                key={idx}
                className="w-6 h-6 sm:w-7 sm:h-7 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xs"
              >
                {b}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-red-50 px-3 py-2 sm:py-3">
          <div className="text-[10px] sm:text-xs text-red-700 font-medium mb-1">Worst Barriers</div>
          <div className="flex items-center gap-1">
            {worstBarriers.map((b, idx) => (
              <div
                key={idx}
                className="w-6 h-6 sm:w-7 sm:h-7 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xs"
              >
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="divide-y divide-gray-100">
        {barrierStats.map((stat) => (
          <div
            key={stat.barrier}
            className={`px-3 sm:px-4 py-2 hover:bg-gray-50 transition-colors ${
              bestBarriers.includes(stat.barrier)
                ? 'bg-green-50/50'
                : worstBarriers.includes(stat.barrier)
                  ? 'bg-red-50/50'
                  : ''
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Barrier Number */}
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                  bestBarriers.includes(stat.barrier)
                    ? 'bg-green-600 text-white'
                    : worstBarriers.includes(stat.barrier)
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                }`}
              >
                {stat.barrier}
              </div>

              {/* Win Rate Bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        stat.winRate === maxWinRate
                          ? 'bg-green-600'
                          : stat.winRate >= maxWinRate * 0.7
                            ? 'bg-blue-500'
                            : 'bg-gray-400'
                      }`}
                      style={{ width: `${(stat.winRate / maxWinRate) * 100}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-bold whitespace-nowrap ${
                      stat.winRate === maxWinRate ? 'text-green-600' : 'text-gray-900'
                    }`}
                  >
                    {stat.winRate.toFixed(1)}%
                  </span>
                </div>
                <div className="text-[10px] sm:text-xs text-gray-600">
                  {stat.wins}W-{stat.places}P from {stat.starts} starts ({stat.placeRate.toFixed(1)}
                  % place)
                </div>
              </div>

              {/* Trend Indicator */}
              {stat.winRate === maxWinRate && (
                <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-500 text-center border-t border-gray-200">
        Based on last {sampleSize} races at this track and distance
      </div>
    </motion.div>
  );
}
