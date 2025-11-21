'use client';

import { motion } from 'framer-motion';
import { Cloud, Droplets, Wind, Thermometer, Navigation } from 'lucide-react';

interface TrackConditionsWidgetProps {
  track: string;
  raceNumber: number;
  trackRating: string;
  weather: string;
  temperature: number;
  windSpeed: number;
  windDirection: string;
  railPosition: string;
  lastUpdated: string;
}

export default function TrackConditionsWidget({
  track,
  raceNumber,
  trackRating,
  weather,
  temperature,
  windSpeed,
  windDirection,
  railPosition,
  lastUpdated,
}: TrackConditionsWidgetProps) {
  const getRatingColor = (rating: string) => {
    const condition = rating.toLowerCase();
    if (condition.includes('firm') || condition.includes('good')) return 'text-green-600';
    if (condition.includes('soft')) return 'text-orange-600';
    if (condition.includes('heavy')) return 'text-red-600';
    return 'text-gray-900';
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
            <h4 className="font-bold text-sm sm:text-base truncate">Track Conditions</h4>
            <p className="text-[10px] sm:text-xs text-white/80 truncate">
              {track} R{raceNumber}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] sm:text-xs text-white/80">Rating</div>
            <div className="text-lg sm:text-2xl font-bold whitespace-nowrap">{trackRating}</div>
          </div>
        </div>
      </div>

      {/* Conditions Grid */}
      <div className="divide-y divide-gray-100">
        {/* Weather */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Cloud className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600">Weather</span>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-gray-900">{weather}</span>
        </div>

        {/* Temperature */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Thermometer className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600">Temperature</span>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-gray-900">{temperature}°C</span>
        </div>

        {/* Wind */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Wind className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600">Wind</span>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-gray-900">
            {windSpeed}km/h {windDirection}
          </span>
        </div>

        {/* Rail Position */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600">Rail Position</span>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-gray-900">{railPosition}</span>
        </div>

        {/* Track Rating (detailed) */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-gray-50">
          <div className="flex items-center gap-2 sm:gap-3">
            <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600">Track Condition</span>
          </div>
          <span className={`text-xs sm:text-sm font-bold ${getRatingColor(trackRating)}`}>
            {trackRating}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-500 text-center border-t border-gray-200">
        Updated {lastUpdated}
      </div>
    </motion.div>
  );
}
