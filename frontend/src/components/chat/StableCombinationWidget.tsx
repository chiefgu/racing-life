'use client';

import { motion } from 'framer-motion';
import { Users, Trophy, TrendingUp } from 'lucide-react';

interface Combination {
  trainer: string;
  jockey: string;
  starts: number;
  wins: number;
  places: number;
  winRate: number;
  placeRate: number;
  profitLoss: number;
  form: string;
  recentWins?: string[];
}

interface StableCombinationWidgetProps {
  race: string;
  combinations: Combination[];
  topCombination: {
    trainer: string;
    jockey: string;
    stats: string;
  };
}

export default function StableCombinationWidget({
  race,
  combinations,
  topCombination,
}: StableCombinationWidgetProps) {
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
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <h4 className="font-bold text-sm sm:text-base truncate">Stable Combinations</h4>
            </div>
            <p className="text-[10px] sm:text-xs text-white/80 truncate">{race}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] sm:text-xs text-white/80">Combos</div>
            <div className="text-lg sm:text-2xl font-bold whitespace-nowrap">
              {combinations.length}
            </div>
          </div>
        </div>
      </div>

      {/* Top Combination Highlight */}
      {topCombination && (
        <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-gray-600" />
            <span className="text-xs sm:text-sm font-bold text-gray-900">Top Partnership</span>
          </div>
          <div className="text-sm sm:text-base font-bold text-gray-900">
            {topCombination.trainer} + {topCombination.jockey}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-700">{topCombination.stats}</div>
        </div>
      )}

      {/* Combinations List */}
      <div className="divide-y divide-gray-100">
        {combinations.map((combo, index) => (
          <div key={index} className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 transition-colors">
            {/* Partnership Header */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                    {combo.trainer}
                  </div>
                  <span className="text-gray-400">+</span>
                  <div className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                    {combo.jockey}
                  </div>
                </div>
                <div className="text-[10px] sm:text-xs text-gray-600">
                  {combo.wins}-{combo.places}-{combo.starts - combo.wins - combo.places} (
                  {combo.starts} starts)
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div
                  className={`text-sm sm:text-base font-bold ${
                    combo.winRate >= 25
                      ? 'text-green-600'
                      : combo.winRate >= 15
                        ? 'text-blue-600'
                        : 'text-gray-900'
                  }`}
                >
                  {combo.winRate.toFixed(1)}%
                </div>
                <div className="text-[10px] sm:text-xs text-gray-600">
                  {combo.placeRate.toFixed(1)}% place
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="p-2 bg-gray-50 rounded text-center">
                <div className="text-[10px] text-gray-600 mb-0.5">Form</div>
                <div className="text-xs sm:text-sm font-bold text-gray-900">{combo.form}</div>
              </div>
              <div className="p-2 bg-gray-50 rounded text-center">
                <div className="text-[10px] text-gray-600 mb-0.5">Strike Rate</div>
                <div className="text-xs sm:text-sm font-bold text-gray-900">
                  {combo.winRate.toFixed(0)}%
                </div>
              </div>
              <div
                className={`p-2 rounded text-center ${
                  combo.profitLoss >= 0 ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="text-[10px] text-gray-600 mb-0.5">P/L</div>
                <div
                  className={`text-xs sm:text-sm font-bold ${
                    combo.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {combo.profitLoss >= 0 ? '+' : ''}
                  {combo.profitLoss.toFixed(1)}u
                </div>
              </div>
            </div>

            {/* Recent Wins */}
            {combo.recentWins && combo.recentWins.length > 0 && (
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-green-600 flex-shrink-0" />
                <div className="text-[10px] sm:text-xs text-gray-600">
                  Recent wins: {combo.recentWins.join(', ')}
                </div>
              </div>
            )}
          </div>
        ))}

        {combinations.length === 0 && (
          <div className="px-3 sm:px-4 py-6 text-center text-gray-500 text-sm">
            No notable trainer-jockey combinations in this race
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-500 text-center border-t border-gray-200">
        Partnerships with 10+ starts shown · Profit/Loss based on level stakes
      </div>
    </motion.div>
  );
}
