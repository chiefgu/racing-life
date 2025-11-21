'use client';

import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Activity } from 'lucide-react';

interface RaceResult {
  date: string;
  track: string;
  distance: string;
  position: number;
  totalRunners: number;
  trackCondition: string;
  time?: string;
}

interface FormGuideCardProps {
  horseName: string;
  age: number;
  sex: 'Gelding' | 'Mare' | 'Stallion' | 'Filly' | 'Colt';
  trainer: string;
  jockey: string;
  weight: string;
  barrier: number;
  careerStats: {
    starts: number;
    wins: number;
    places: number;
    prize: string;
  };
  recentForm: RaceResult[];
  trackRecord?: {
    starts: number;
    wins: number;
    places: number;
  };
  distanceRecord?: {
    starts: number;
    wins: number;
    places: number;
  };
}

export default function FormGuideCard({
  horseName,
  age,
  sex,
  trainer,
  jockey,
  weight,
  barrier,
  careerStats,
  recentForm,
  trackRecord,
  distanceRecord,
}: FormGuideCardProps) {
  const getPositionColor = (position: number) => {
    if (position === 1) return 'bg-yellow-500 text-white';
    if (position === 2) return 'bg-gray-400 text-white';
    if (position === 3) return 'bg-orange-600 text-white';
    return 'bg-gray-200 text-gray-700';
  };

  const winRate = ((careerStats.wins / careerStats.starts) * 100).toFixed(0);
  const placeRate = (((careerStats.wins + careerStats.places) / careerStats.starts) * 100).toFixed(
    0
  );

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
            <h4 className="font-bold text-sm sm:text-base truncate">{horseName}</h4>
            <p className="text-[10px] sm:text-xs text-white/80 truncate">
              {age}yo {sex} · Barrier {barrier} · {weight}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] sm:text-xs text-white/80">Win Rate</div>
            <div className="text-lg sm:text-2xl font-bold whitespace-nowrap">{winRate}%</div>
          </div>
        </div>
      </div>

      {/* Trainer & Jockey Info */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border-b border-gray-100">
        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div>
            <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Trainer</div>
            <div className="font-medium text-gray-900 truncate">{trainer}</div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Jockey</div>
            <div className="font-medium text-gray-900 truncate">{jockey}</div>
          </div>
        </div>
      </div>

      {/* Career Stats */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
        <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
          <div>
            <div className="text-[10px] sm:text-xs text-gray-500 mb-1">Starts</div>
            <div className="text-base sm:text-lg font-bold text-gray-900">{careerStats.starts}</div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-gray-500 mb-1">Wins</div>
            <div className="text-base sm:text-lg font-bold text-green-600">{careerStats.wins}</div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-gray-500 mb-1">Places</div>
            <div className="text-base sm:text-lg font-bold text-blue-600">{careerStats.places}</div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-gray-500 mb-1">Prize</div>
            <div className="text-xs sm:text-sm font-bold text-gray-900">{careerStats.prize}</div>
          </div>
        </div>
      </div>

      {/* Track & Distance Records */}
      {(trackRecord || distanceRecord) && (
        <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            {trackRecord && (
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-primary" />
                  <span className="text-[10px] sm:text-xs font-semibold text-gray-900">
                    This Track
                  </span>
                </div>
                <div className="text-[10px] sm:text-xs text-gray-600">
                  {trackRecord.starts} starts: {trackRecord.wins}W-{trackRecord.places}P
                </div>
              </div>
            )}
            {distanceRecord && (
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-primary" />
                  <span className="text-[10px] sm:text-xs font-semibold text-gray-900">
                    This Distance
                  </span>
                </div>
                <div className="text-[10px] sm:text-xs text-gray-600">
                  {distanceRecord.starts} starts: {distanceRecord.wins}W-{distanceRecord.places}P
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Form */}
      <div className="divide-y divide-gray-100">
        {recentForm.slice(0, 5).map((result, index) => (
          <div
            key={index}
            className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              {/* Position Badge */}
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded font-bold text-xs sm:text-sm flex-shrink-0 ${getPositionColor(
                  result.position
                )}`}
              >
                {result.position}
              </div>

              {/* Race Details */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                  {result.track} · {result.distance}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 truncate">
                  {result.date} · {result.trackCondition} · {result.position}/{result.totalRunners}
                  {result.time && ` · ${result.time}`}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-500 text-center border-t border-gray-200">
        Complete form guide · Updated regularly
      </div>
    </motion.div>
  );
}
