'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { TrendingUp, TrendingDown, Trophy, Target, Activity } from 'lucide-react';

interface HorseStats {
  name: string;
  number: number;
  barrier: number;
  jockey: string;
  trainer: string;
  weight: string;
  age: number;
  sex: string;

  // Odds
  currentOdds: number;
  wasOdds?: number;
  bestOddsBookmaker?: {
    name: string;
    logo: string;
    url: string;
  };

  // Form
  lastFive: string; // e.g., "1-2-3-1-4"
  careerRecord: {
    starts: number;
    wins: number;
    places: number;
    winPct: number;
  };

  // Track/Distance
  trackRecord: {
    starts: number;
    wins: number;
    places: number;
    winPct: number;
  };
  distanceRecord: {
    starts: number;
    wins: number;
    places: number;
    winPct: number;
  };

  // Performance
  prizeMoney: number;
  speedRating: number;
  lastStart: {
    position: number;
    margin: string;
    track: string;
    distance: number;
  };
}

interface HorseComparisonProps {
  horses: HorseStats[];
  race: string;
}

export default function HorseComparison({ horses, race }: HorseComparisonProps) {
  // Get best values for comparison highlighting
  const bestOdds = Math.min(...horses.map((h) => h.currentOdds));
  const bestSpeedRating = Math.max(...horses.map((h) => h.speedRating));
  const bestTrackWinPct = Math.max(...horses.map((h) => h.trackRecord.winPct));
  const bestDistanceWinPct = Math.max(...horses.map((h) => h.distanceRecord.winPct));

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
            <h4 className="font-bold text-sm sm:text-base truncate">Horse Comparison</h4>
            <p className="text-[10px] sm:text-xs text-white/80 truncate">{race}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] sm:text-xs text-white/80">Runners</div>
            <div className="text-lg sm:text-2xl font-bold whitespace-nowrap">{horses.length}</div>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4">
        {horses.map((horse, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Horse Header */}
            <div className="bg-gray-50 border-b border-gray-100 px-3 py-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-brand-primary text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0">
                    {horse.number}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                      {horse.name}
                    </h5>
                    <p className="text-[10px] sm:text-xs text-gray-600 truncate">
                      {horse.age}yo {horse.sex} · Barrier {horse.barrier}
                    </p>
                  </div>
                </div>

                {/* Odds Badge */}
                <div className="text-right flex-shrink-0">
                  <div
                    className={`text-base sm:text-lg font-bold ${horse.currentOdds === bestOdds ? 'text-green-600' : 'text-gray-900'}`}
                  >
                    ${horse.currentOdds.toFixed(2)}
                  </div>
                  {horse.bestOddsBookmaker && horse.bestOddsBookmaker.logo && (
                    <a
                      href={horse.bestOddsBookmaker.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Image
                        src={horse.bestOddsBookmaker.logo}
                        alt={horse.bestOddsBookmaker.name}
                        width={48}
                        height={16}
                        className="object-contain opacity-60 hover:opacity-100 transition-opacity"
                      />
                    </a>
                  )}
                  {horse.wasOdds && (
                    <div className="flex items-center gap-1 justify-end text-[10px] sm:text-xs">
                      {horse.currentOdds < horse.wasOdds ? (
                        <>
                          <TrendingDown className="w-3 h-3 text-green-600" />
                          <span className="text-green-600">${horse.wasOdds.toFixed(2)}</span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-3 h-3 text-red-600" />
                          <span className="text-red-600">${horse.wasOdds.toFixed(2)}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Sections */}
            <div className="px-3 py-2 space-y-2">
              {/* Connections */}
              <div>
                <div className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-1">
                  Connections
                </div>
                <div className="text-[10px] sm:text-xs text-gray-600 space-y-0.5">
                  <div>
                    <span className="text-gray-500">Jockey:</span> {horse.jockey}
                  </div>
                  <div>
                    <span className="text-gray-500">Trainer:</span> {horse.trainer}
                  </div>
                  <div>
                    <span className="text-gray-500">Weight:</span> {horse.weight}
                  </div>
                </div>
              </div>

              {/* Form */}
              <div>
                <div className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  Recent Form
                </div>
                <div className="flex items-center gap-1 mb-1">
                  {horse.lastFive.split('-').map((pos, idx) => (
                    <div
                      key={idx}
                      className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-[10px] sm:text-xs font-bold rounded ${
                        pos === '1'
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
                <div className="text-[10px] sm:text-xs text-gray-600">
                  Career: {horse.careerRecord.wins}-{horse.careerRecord.places}-
                  {horse.careerRecord.starts - horse.careerRecord.wins - horse.careerRecord.places}{' '}
                  ({horse.careerRecord.winPct}% wins)
                </div>
              </div>

              {/* Track Record */}
              <div>
                <div className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Track Record
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${horse.trackRecord.winPct === bestTrackWinPct ? 'bg-green-600' : 'bg-blue-500'}`}
                      style={{ width: `${horse.trackRecord.winPct}%` }}
                    />
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-semibold ${horse.trackRecord.winPct === bestTrackWinPct ? 'text-green-600' : 'text-gray-900'}`}
                  >
                    {horse.trackRecord.winPct}%
                  </span>
                </div>
                <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5">
                  {horse.trackRecord.wins}-{horse.trackRecord.places}-
                  {horse.trackRecord.starts - horse.trackRecord.wins - horse.trackRecord.places} (
                  {horse.trackRecord.starts} starts)
                </div>
              </div>

              {/* Distance Record */}
              <div>
                <div className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Distance Record
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${horse.distanceRecord.winPct === bestDistanceWinPct ? 'bg-green-600' : 'bg-blue-500'}`}
                      style={{ width: `${horse.distanceRecord.winPct}%` }}
                    />
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-semibold ${horse.distanceRecord.winPct === bestDistanceWinPct ? 'text-green-600' : 'text-gray-900'}`}
                  >
                    {horse.distanceRecord.winPct}%
                  </span>
                </div>
                <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5">
                  {horse.distanceRecord.wins}-{horse.distanceRecord.places}-
                  {horse.distanceRecord.starts -
                    horse.distanceRecord.wins -
                    horse.distanceRecord.places}{' '}
                  ({horse.distanceRecord.starts} starts)
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="border-t border-gray-100 pt-2">
                <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                  <div>
                    <div className="text-gray-500">Speed Rating</div>
                    <div
                      className={`font-bold ${horse.speedRating === bestSpeedRating ? 'text-green-600' : 'text-gray-900'}`}
                    >
                      {horse.speedRating}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Prize Money</div>
                    <div className="font-bold text-gray-900">
                      ${(horse.prizeMoney / 1000).toFixed(0)}k
                    </div>
                  </div>
                </div>
              </div>

              {/* Last Start */}
              <div className="bg-gray-50 -mx-3 -mb-2 px-3 py-2 border-t border-gray-100">
                <div className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-1">
                  Last Start
                </div>
                <div className="text-[10px] sm:text-xs text-gray-600">
                  {horse.lastStart.position === 1
                    ? '🥇'
                    : horse.lastStart.position === 2
                      ? '🥈'
                      : horse.lastStart.position === 3
                        ? '🥉'
                        : ''}{' '}
                  Finished {horse.lastStart.position}
                  {horse.lastStart.position === 1
                    ? 'st'
                    : horse.lastStart.position === 2
                      ? 'nd'
                      : horse.lastStart.position === 3
                        ? 'rd'
                        : 'th'}{' '}
                  ({horse.lastStart.margin}) · {horse.lastStart.track} {horse.lastStart.distance}m
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-500 text-center border-t border-gray-200">
        Best values highlighted in green · Tap any horse for full details
      </div>
    </motion.div>
  );
}
