'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { TrendingDown, TrendingUp, Activity } from 'lucide-react';

interface Mover {
  horseName: string;
  horseNumber: number;
  currentOdds: number;
  openingOdds: number;
  percentageChange: number;
  volume: 'high' | 'medium' | 'low';
  bestOddsBookmaker?: {
    name: string;
    logo: string;
    url: string;
  };
}

interface MarketMoversWidgetProps {
  race: string;
  steamers: Mover[];
  drifters: Mover[];
  lastUpdated: string;
}

export default function MarketMoversWidget({
  race,
  steamers,
  drifters,
  lastUpdated,
}: MarketMoversWidgetProps) {
  const getVolumeText = (volume: string) => {
    return volume.charAt(0).toUpperCase() + volume.slice(1);
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
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <h4 className="font-bold text-sm sm:text-base truncate">Market Movers</h4>
            </div>
            <p className="text-[10px] sm:text-xs text-white/80 truncate">{race}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] sm:text-xs text-white/80">Live</div>
            <div className="text-base sm:text-lg font-bold whitespace-nowrap">Updates</div>
          </div>
        </div>
      </div>

      {/* Steamers Section */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200">
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          <h5 className="text-xs sm:text-sm font-bold text-green-900 uppercase tracking-wide">
            Steamers (Shortening)
          </h5>
        </div>
        <div className="space-y-2">
          {steamers.map((horse, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-white rounded border border-green-200"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {horse.horseNumber}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                    {horse.horseName}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-600">
                    {getVolumeText(horse.volume)} volume
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm text-gray-500 line-through">
                    ${horse.openingOdds.toFixed(2)}
                  </span>
                  <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600" />
                  <span className="text-sm sm:text-base font-bold text-green-600">
                    ${horse.currentOdds.toFixed(2)}
                  </span>
                </div>
                {horse.bestOddsBookmaker && horse.bestOddsBookmaker.logo && (
                  <a
                    href={horse.bestOddsBookmaker.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
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
                <div className="text-[10px] sm:text-xs text-green-600 font-semibold">
                  {horse.percentageChange.toFixed(0)}% shorter
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drifters Section */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200">
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
          <h5 className="text-xs sm:text-sm font-bold text-red-900 uppercase tracking-wide">
            Drifters (Lengthening)
          </h5>
        </div>
        <div className="space-y-2">
          {drifters.map((horse, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-white rounded border border-red-200"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {horse.horseNumber}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                    {horse.horseName}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-600">
                    {getVolumeText(horse.volume)} volume
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm text-gray-500 line-through">
                    ${horse.openingOdds.toFixed(2)}
                  </span>
                  <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-600" />
                  <span className="text-sm sm:text-base font-bold text-red-600">
                    ${horse.currentOdds.toFixed(2)}
                  </span>
                </div>
                {horse.bestOddsBookmaker && horse.bestOddsBookmaker.logo && (
                  <a
                    href={horse.bestOddsBookmaker.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
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
                <div className="text-[10px] sm:text-xs text-red-600 font-semibold">
                  +{horse.percentageChange.toFixed(0)}% longer
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-500 text-center border-t border-gray-200">
        Updated {lastUpdated} · Live odds from multiple bookmakers
      </div>
    </motion.div>
  );
}
