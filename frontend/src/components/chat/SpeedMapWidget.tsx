'use client';

import { motion } from 'framer-motion';
import { MapPin, Zap } from 'lucide-react';

interface HorsePosition {
  horseName: string;
  horseNumber: number;
  barrier: number;
  runningStyle: 'Leader' | 'On Pace' | 'Midfield' | 'Back';
  earlySpeed: number; // 1-10
}

interface SpeedMapWidgetProps {
  race: string;
  distance: number;
  horses: HorsePosition[];
}

export default function SpeedMapWidget({ race, distance, horses }: SpeedMapWidgetProps) {
  // Group horses by running style
  const leaders = horses.filter((h) => h.runningStyle === 'Leader');
  const onPace = horses.filter((h) => h.runningStyle === 'On Pace');
  const midfield = horses.filter((h) => h.runningStyle === 'Midfield');
  const back = horses.filter((h) => h.runningStyle === 'Back');

  const getSpeedColor = (speed: number) => {
    if (speed >= 8) return 'bg-red-600';
    if (speed >= 6) return 'bg-orange-600';
    if (speed >= 4) return 'bg-blue-600';
    return 'bg-gray-600';
  };

  const HorseChip = ({ horse }: { horse: HorsePosition }) => (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-300 rounded-full text-xs">
      <div
        className={`w-5 h-5 ${getSpeedColor(
          horse.earlySpeed
        )} text-white rounded-full flex items-center justify-center font-bold text-[10px]`}
      >
        {horse.horseNumber}
      </div>
      <span className="font-medium text-gray-900">{horse.horseName}</span>
      <span className="text-gray-500 text-[10px]">({horse.barrier})</span>
    </div>
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
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <h4 className="font-bold text-sm sm:text-base truncate">Speed Map</h4>
            </div>
            <p className="text-[10px] sm:text-xs text-white/80 truncate">{race}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] sm:text-xs text-white/80">Distance</div>
            <div className="text-lg sm:text-2xl font-bold whitespace-nowrap">{distance}m</div>
          </div>
        </div>
      </div>

      {/* Speed Map Visualization */}
      <div className="p-3 sm:p-4 space-y-3">
        {/* Leaders */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-red-600" />
            <h5 className="text-xs sm:text-sm font-bold text-gray-900">
              Leaders ({leaders.length})
            </h5>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {leaders.map((horse, idx) => (
              <HorseChip key={idx} horse={horse} />
            ))}
            {leaders.length === 0 && (
              <span className="text-xs text-gray-500 italic">No natural leaders</span>
            )}
          </div>
        </div>

        {/* On Pace */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-orange-600 rounded" />
            <h5 className="text-xs sm:text-sm font-bold text-gray-900">
              On Pace ({onPace.length})
            </h5>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {onPace.map((horse, idx) => (
              <HorseChip key={idx} horse={horse} />
            ))}
          </div>
        </div>

        {/* Midfield */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-blue-600 rounded" />
            <h5 className="text-xs sm:text-sm font-bold text-gray-900">
              Midfield ({midfield.length})
            </h5>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {midfield.map((horse, idx) => (
              <HorseChip key={idx} horse={horse} />
            ))}
          </div>
        </div>

        {/* Back Markers */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-gray-600 rounded" />
            <h5 className="text-xs sm:text-sm font-bold text-gray-900">
              Back Markers ({back.length})
            </h5>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {back.map((horse, idx) => (
              <HorseChip key={idx} horse={horse} />
            ))}
          </div>
        </div>

        {/* Pace Analysis */}
        <div className="mt-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="text-xs sm:text-sm text-blue-900">
            <span className="font-semibold">Pace Analysis: </span>
            {leaders.length === 0 && (
              <span>Lack of natural speed may result in slow pace. Backmarkers favored.</span>
            )}
            {leaders.length === 1 && (
              <span>Single leader likely to get cheap splits. Could be hard to catch.</span>
            )}
            {leaders.length >= 2 && leaders.length <= 3 && (
              <span>Genuine pace battle expected. Good for strong closers.</span>
            )}
            {leaders.length > 3 && <span>Hot pace guaranteed. Backmarkers strongly favored.</span>}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-500 text-center border-t border-gray-200">
        Based on recent running patterns · Barrier drawn in brackets
      </div>
    </motion.div>
  );
}
