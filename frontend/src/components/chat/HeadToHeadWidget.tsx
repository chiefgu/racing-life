'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Swords, TrendingDown } from 'lucide-react';

interface HorseStats {
  name: string;
  number: number;
  jockey: string;
  trainer: string;
  currentOdds: number;
  wasOdds?: number;
  bestOddsBookmaker?: {
    name: string;
    logo: string;
    url: string;
  };
  form: string; // e.g., "1-2-3"
  careerWins: number;
  careerStarts: number;
  trackWins: number;
  trackStarts: number;
  speedRating: number;
  weight: string;
  barrier: number;
}

interface HeadToHeadWidgetProps {
  race: string;
  horse1: HorseStats;
  horse2: HorseStats;
  previousMeetings?: {
    total: number;
    horse1Wins: number;
    horse2Wins: number;
  };
}

export default function HeadToHeadWidget({
  race,
  horse1,
  horse2,
  previousMeetings,
}: HeadToHeadWidgetProps) {
  const compareMetric = (value1: number, value2: number) => {
    if (value1 > value2) return 'horse1';
    if (value2 > value1) return 'horse2';
    return 'equal';
  };

  const getCompareClass = (winner: string, forHorse: 'horse1' | 'horse2') => {
    if (winner === 'equal') return 'text-gray-900';
    return winner === forHorse ? 'text-green-600 font-bold' : 'text-gray-600';
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
        <div className="flex items-center justify-center gap-2 mb-1">
          <Swords className="w-4 h-4" />
          <h4 className="font-bold text-sm sm:text-base">Head to Head</h4>
        </div>
        <p className="text-[10px] sm:text-xs text-white/80 text-center">{race}</p>
      </div>

      {/* Horse Names */}
      <div className="grid grid-cols-2 gap-px bg-gray-200">
        <div className="bg-white px-3 py-2 sm:py-3 text-center">
          <div className="text-base sm:text-lg font-bold text-gray-900 truncate">{horse1.name}</div>
          <div className="text-[10px] sm:text-xs text-gray-600">#{horse1.number}</div>
        </div>
        <div className="bg-white px-3 py-2 sm:py-3 text-center">
          <div className="text-base sm:text-lg font-bold text-gray-900 truncate">{horse2.name}</div>
          <div className="text-[10px] sm:text-xs text-gray-600">#{horse2.number}</div>
        </div>
      </div>

      {/* Comparison Rows */}
      <div className="divide-y divide-gray-100">
        {/* Odds */}
        <div className="grid grid-cols-[1fr,auto,1fr] gap-2 px-3 sm:px-4 py-2 items-center">
          <div className="text-right">
            <div
              className={`text-sm sm:text-base ${getCompareClass(
                compareMetric(horse2.currentOdds, horse1.currentOdds),
                'horse1'
              )}`}
            >
              ${horse1.currentOdds.toFixed(2)}
              {horse1.wasOdds && horse1.currentOdds < horse1.wasOdds && (
                <TrendingDown className="inline w-3 h-3 ml-1 text-green-600" />
              )}
            </div>
            {horse1.bestOddsBookmaker && horse1.bestOddsBookmaker.logo && (
              <a
                href={horse1.bestOddsBookmaker.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={horse1.bestOddsBookmaker.logo}
                  alt={horse1.bestOddsBookmaker.name}
                  width={48}
                  height={16}
                  className="object-contain opacity-60 hover:opacity-100 transition-opacity"
                />
              </a>
            )}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-500 font-medium whitespace-nowrap">
            Odds
          </div>
          <div className="text-left">
            <div
              className={`text-sm sm:text-base ${getCompareClass(
                compareMetric(horse1.currentOdds, horse2.currentOdds),
                'horse2'
              )}`}
            >
              ${horse2.currentOdds.toFixed(2)}
              {horse2.wasOdds && horse2.currentOdds < horse2.wasOdds && (
                <TrendingDown className="inline w-3 h-3 ml-1 text-green-600" />
              )}
            </div>
            {horse2.bestOddsBookmaker && horse2.bestOddsBookmaker.logo && (
              <a
                href={horse2.bestOddsBookmaker.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={horse2.bestOddsBookmaker.logo}
                  alt={horse2.bestOddsBookmaker.name}
                  width={48}
                  height={16}
                  className="object-contain opacity-60 hover:opacity-100 transition-opacity"
                />
              </a>
            )}
          </div>
        </div>

        {/* Speed Rating */}
        <div className="grid grid-cols-[1fr,auto,1fr] gap-2 px-3 sm:px-4 py-2 items-center bg-gray-50">
          <div
            className={`text-right text-sm sm:text-base ${getCompareClass(
              compareMetric(horse1.speedRating, horse2.speedRating),
              'horse1'
            )}`}
          >
            {horse1.speedRating}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-500 font-medium whitespace-nowrap">
            Speed Rating
          </div>
          <div
            className={`text-left text-sm sm:text-base ${getCompareClass(
              compareMetric(horse2.speedRating, horse1.speedRating),
              'horse2'
            )}`}
          >
            {horse2.speedRating}
          </div>
        </div>

        {/* Career Win % */}
        <div className="grid grid-cols-[1fr,auto,1fr] gap-2 px-3 sm:px-4 py-2 items-center">
          <div
            className={`text-right text-sm sm:text-base ${getCompareClass(
              compareMetric(
                (horse1.careerWins / horse1.careerStarts) * 100,
                (horse2.careerWins / horse2.careerStarts) * 100
              ),
              'horse1'
            )}`}
          >
            {((horse1.careerWins / horse1.careerStarts) * 100).toFixed(0)}%
          </div>
          <div className="text-[10px] sm:text-xs text-gray-500 font-medium whitespace-nowrap">
            Career Win %
          </div>
          <div
            className={`text-left text-sm sm:text-base ${getCompareClass(
              compareMetric(
                (horse2.careerWins / horse2.careerStarts) * 100,
                (horse1.careerWins / horse1.careerStarts) * 100
              ),
              'horse2'
            )}`}
          >
            {((horse2.careerWins / horse2.careerStarts) * 100).toFixed(0)}%
          </div>
        </div>

        {/* Track Win % */}
        <div className="grid grid-cols-[1fr,auto,1fr] gap-2 px-3 sm:px-4 py-2 items-center bg-gray-50">
          <div
            className={`text-right text-sm sm:text-base ${getCompareClass(
              compareMetric(
                (horse1.trackWins / horse1.trackStarts) * 100,
                (horse2.trackWins / horse2.trackStarts) * 100
              ),
              'horse1'
            )}`}
          >
            {((horse1.trackWins / horse1.trackStarts) * 100).toFixed(0)}%
          </div>
          <div className="text-[10px] sm:text-xs text-gray-500 font-medium whitespace-nowrap">
            Track Win %
          </div>
          <div
            className={`text-left text-sm sm:text-base ${getCompareClass(
              compareMetric(
                (horse2.trackWins / horse2.trackStarts) * 100,
                (horse1.trackWins / horse1.trackStarts) * 100
              ),
              'horse2'
            )}`}
          >
            {((horse2.trackWins / horse2.trackStarts) * 100).toFixed(0)}%
          </div>
        </div>

        {/* Barrier */}
        <div className="grid grid-cols-[1fr,auto,1fr] gap-2 px-3 sm:px-4 py-2 items-center">
          <div
            className={`text-right text-sm sm:text-base ${getCompareClass(
              compareMetric(horse2.barrier, horse1.barrier),
              'horse1'
            )}`}
          >
            {horse1.barrier}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-500 font-medium whitespace-nowrap">
            Barrier
          </div>
          <div
            className={`text-left text-sm sm:text-base ${getCompareClass(
              compareMetric(horse1.barrier, horse2.barrier),
              'horse2'
            )}`}
          >
            {horse2.barrier}
          </div>
        </div>

        {/* Weight */}
        <div className="grid grid-cols-[1fr,auto,1fr] gap-2 px-3 sm:px-4 py-2 items-center bg-gray-50">
          <div className="text-right text-xs sm:text-sm text-gray-900">{horse1.weight}</div>
          <div className="text-[10px] sm:text-xs text-gray-500 font-medium whitespace-nowrap">
            Weight
          </div>
          <div className="text-left text-xs sm:text-sm text-gray-900">{horse2.weight}</div>
        </div>

        {/* Jockey */}
        <div className="grid grid-cols-[1fr,auto,1fr] gap-2 px-3 sm:px-4 py-2 items-center">
          <div className="text-right text-xs sm:text-sm text-gray-900 truncate">
            {horse1.jockey}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-500 font-medium whitespace-nowrap">
            Jockey
          </div>
          <div className="text-left text-xs sm:text-sm text-gray-900 truncate">{horse2.jockey}</div>
        </div>
      </div>

      {/* Previous Meetings */}
      {previousMeetings && previousMeetings.total > 0 && (
        <div className="bg-blue-50 px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-200">
          <div className="text-[10px] sm:text-xs font-semibold text-gray-900 mb-1 text-center">
            Previous Meetings
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="font-bold text-gray-900">{previousMeetings.horse1Wins}</div>
              <div className="text-[10px] text-gray-600">{horse1.name}</div>
            </div>
            <div>
              <div className="font-bold text-gray-500">{previousMeetings.total}</div>
              <div className="text-[10px] text-gray-600">Races</div>
            </div>
            <div>
              <div className="font-bold text-gray-900">{previousMeetings.horse2Wins}</div>
              <div className="text-[10px] text-gray-600">{horse2.name}</div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-50 px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-500 text-center border-t border-gray-200">
        Better metrics highlighted in green
      </div>
    </motion.div>
  );
}
