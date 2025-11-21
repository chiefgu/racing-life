'use client';

import { motion } from 'framer-motion';
import { Clock, DollarSign, Users, Ruler, Award } from 'lucide-react';

interface RaceInfoWidgetProps {
  track: string;
  raceNumber: number;
  raceName: string;
  distance: number;
  trackCondition: string;
  raceTime: string;
  prizeMoney: string;
  raceClass: string;
  ageRestriction?: string;
  runners: number;
  nominations?: number;
}

export default function RaceInfoWidget({
  track,
  raceNumber,
  raceName,
  distance,
  trackCondition,
  raceTime,
  prizeMoney,
  raceClass,
  ageRestriction,
  runners,
  nominations,
}: RaceInfoWidgetProps) {
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
            <h4 className="font-bold text-sm sm:text-base truncate">{raceName}</h4>
            <p className="text-[10px] sm:text-xs text-white/80 truncate">
              {track} Race {raceNumber}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] sm:text-xs text-white/80">Distance</div>
            <div className="text-lg sm:text-2xl font-bold whitespace-nowrap">{distance}m</div>
          </div>
        </div>
      </div>

      {/* Race Details */}
      <div className="divide-y divide-gray-100">
        {/* Time */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600">Race Time</span>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-gray-900">{raceTime}</span>
        </div>

        {/* Prize Money */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600">Prize Money</span>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-green-600">{prizeMoney}</span>
        </div>

        {/* Runners */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600">Runners</span>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-gray-900">
            {runners} starters{nominations && ` (${nominations} nom.)`}
          </span>
        </div>

        {/* Class */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600">Class</span>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-gray-900">{raceClass}</span>
        </div>

        {/* Distance & Condition */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-gray-50">
          <div className="flex items-center gap-2 sm:gap-3">
            <Ruler className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600">Track</span>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-gray-900">
            {distance}m · {trackCondition}
          </span>
        </div>

        {/* Age Restriction if any */}
        {ageRestriction && (
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-blue-50">
            <span className="text-xs sm:text-sm text-gray-600">Age Restriction</span>
            <span className="text-xs sm:text-sm font-semibold text-blue-900">{ageRestriction}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-500 text-center border-t border-gray-200">
        Race information · Updated regularly
      </div>
    </motion.div>
  );
}
