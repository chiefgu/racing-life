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
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-bold text-xl mb-1">{horseName}</h4>
            <p className="text-sm text-gray-300">
              {age}yo {sex} · Barrier {barrier} · {weight}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded">
              <Trophy className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{winRate}% Win Rate</span>
            </div>
            <div className="text-xs text-gray-400">{placeRate}% Place Rate</div>
          </div>
        </div>

        {/* Trainer & Jockey */}
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-gray-400 mb-0.5">Trainer</div>
            <div className="font-medium">{trainer}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-0.5">Jockey</div>
            <div className="font-medium">{jockey}</div>
          </div>
        </div>
      </div>

      {/* Career Stats */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <div className="text-xs text-gray-500 mb-1">Starts</div>
            <div className="text-lg font-bold text-gray-900">{careerStats.starts}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Wins</div>
            <div className="text-lg font-bold text-green-600">{careerStats.wins}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Places</div>
            <div className="text-lg font-bold text-blue-600">{careerStats.places}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Prize</div>
            <div className="text-sm font-bold text-gray-900">{careerStats.prize}</div>
          </div>
        </div>
      </div>

      {/* Track & Distance Records */}
      {(trackRecord || distanceRecord) && (
        <div className="px-4 py-3 bg-blue-50 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {trackRecord && (
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-900">This Track</span>
                </div>
                <div className="text-xs text-gray-700">
                  {trackRecord.starts} starts: {trackRecord.wins} wins, {trackRecord.places} places
                </div>
              </div>
            )}
            {distanceRecord && (
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-xs font-semibold text-purple-900">This Distance</span>
                </div>
                <div className="text-xs text-gray-700">
                  {distanceRecord.starts} starts: {distanceRecord.wins} wins,{' '}
                  {distanceRecord.places} places
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Form */}
      <div className="px-4 py-3">
        <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">
          Last 5 Runs
        </h5>
        <div className="space-y-2">
          {recentForm.slice(0, 5).map((result, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-3 flex-1">
                {/* Position Badge */}
                <div
                  className={`w-7 h-7 flex items-center justify-center rounded font-bold text-sm ${getPositionColor(
                    result.position
                  )}`}
                >
                  {result.position}
                </div>

                {/* Race Details */}
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {result.track} · {result.distance}
                  </div>
                  <div className="text-xs text-gray-500">
                    {result.date} · {result.trackCondition} · {result.position}/
                    {result.totalRunners}
                    {result.time && ` · ${result.time}`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 text-center border-t border-gray-200">
        Full form guide · Updated regularly
      </div>
    </motion.div>
  );
}
