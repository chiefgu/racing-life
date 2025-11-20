'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { TrendingDown, TrendingUp, ExternalLink } from 'lucide-react';

interface BookmakerOdds {
  bookmaker: string;
  logo: string;
  odds: number;
  wasOdds?: number;
  url: string;
}

interface OddsComparisonWidgetProps {
  horseName: string;
  race: string;
  bookmakerOdds: BookmakerOdds[];
}

export default function OddsComparisonWidget({
  horseName,
  race,
  bookmakerOdds,
}: OddsComparisonWidgetProps) {
  // Sort by best odds (lowest number)
  const sortedOdds = [...bookmakerOdds].sort((a, b) => a.odds - b.odds);
  const bestOdds = sortedOdds[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden my-3"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-primary-intense text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-base">{horseName}</h4>
            <p className="text-xs text-white/80">{race}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/80">Best Odds</div>
            <div className="text-2xl font-bold">${bestOdds.odds.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Bookmaker Odds List */}
      <div className="divide-y divide-gray-100">
        {sortedOdds.map((bookie, index) => {
          const isBest = index === 0;
          const hasChanged = bookie.wasOdds !== undefined;
          const hasIncreased = hasChanged && bookie.odds > bookie.wasOdds!;
          const hasDecreased = hasChanged && bookie.odds < bookie.wasOdds!;

          return (
            <a
              key={bookie.bookmaker}
              href={bookie.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group ${
                isBest ? 'bg-green-50' : ''
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                {/* Logo */}
                <div className="w-16 h-8 bg-white rounded border border-gray-200 flex items-center justify-center p-1 flex-shrink-0">
                  <Image
                    src={bookie.logo}
                    alt={bookie.bookmaker}
                    width={56}
                    height={28}
                    className="object-contain"
                  />
                </div>

                {/* Bookmaker Name */}
                <span className="font-medium text-gray-900 text-sm">{bookie.bookmaker}</span>

                {/* Best Badge */}
                {isBest && (
                  <span className="bg-green-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    BEST
                  </span>
                )}
              </div>

              {/* Odds and Change */}
              <div className="flex items-center gap-3">
                {/* Price Change Indicator */}
                {hasChanged && (
                  <div className="flex items-center gap-1 text-xs">
                    {hasDecreased && (
                      <>
                        <TrendingDown className="w-3 h-3 text-green-600" />
                        <span className="text-green-600 font-medium">
                          ${bookie.wasOdds!.toFixed(2)}
                        </span>
                      </>
                    )}
                    {hasIncreased && (
                      <>
                        <TrendingUp className="w-3 h-3 text-red-600" />
                        <span className="text-red-600 font-medium">
                          ${bookie.wasOdds!.toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Current Odds */}
                <div className="text-xl font-bold text-gray-900">${bookie.odds.toFixed(2)}</div>

                {/* External Link Icon */}
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-brand-primary transition-colors" />
              </div>
            </a>
          );
        })}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 text-center">
        Odds updated live · Click to bet with bookmaker
      </div>
    </motion.div>
  );
}
