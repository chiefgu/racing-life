'use client';

import { motion } from 'framer-motion';
import { Glasses, TrendingUp, TrendingDown } from 'lucide-react';

interface GearChange {
  horseName: string;
  horseNumber: number;
  change: string;
  changeType: 'on' | 'off' | 'added' | 'removed';
  previousPerformance?: {
    withGear: { starts: number; wins: number; places: number };
    withoutGear: { starts: number; wins: number; places: number };
  };
  impact: 'positive' | 'negative' | 'neutral';
}

interface GearChangesWidgetProps {
  race: string;
  changes: GearChange[];
}

export default function GearChangesWidget({ race, changes }: GearChangesWidgetProps) {
  const getImpactBadge = (impact: string) => {
    if (impact === 'positive')
      return (
        <span className="text-xs px-2 py-0.5 bg-gray-100 text-green-700 rounded font-medium">
          Positive
        </span>
      );
    if (impact === 'negative')
      return (
        <span className="text-xs px-2 py-0.5 bg-gray-100 text-red-700 rounded font-medium">
          Negative
        </span>
      );
    return null;
  };

  const getChangeIcon = (type: string) => {
    if (type === 'on' || type === 'added') return <TrendingUp className="w-3 h-3 text-green-600" />;
    return <TrendingDown className="w-3 h-3 text-red-600" />;
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
              <Glasses className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <h4 className="font-bold text-sm sm:text-base truncate">Gear Changes</h4>
            </div>
            <p className="text-[10px] sm:text-xs text-white/80 truncate">{race}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] sm:text-xs text-white/80">Changes</div>
            <div className="text-lg sm:text-2xl font-bold whitespace-nowrap">{changes.length}</div>
          </div>
        </div>
      </div>

      {/* Changes List */}
      <div className="divide-y divide-gray-100">
        {changes.map((change, index) => (
          <div key={index} className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 transition-colors">
            {/* Horse and Change */}
            <div className="flex items-start gap-3 mb-2">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-brand-primary text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                {change.horseNumber}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                    {change.horseName}
                  </span>
                  {getImpactBadge(change.impact)}
                </div>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-700">
                  {getChangeIcon(change.changeType)}
                  <span className="font-medium">{change.change}</span>
                </div>
              </div>
            </div>

            {/* Performance Stats if available */}
            {change.previousPerformance && (
              <div className="ml-9 sm:ml-10 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-green-50 border border-green-200 rounded">
                  <div className="text-[10px] text-green-700 font-medium mb-0.5">With Gear</div>
                  <div className="font-bold text-green-900">
                    {change.previousPerformance.withGear.wins}-
                    {change.previousPerformance.withGear.places}-
                    {change.previousPerformance.withGear.starts -
                      change.previousPerformance.withGear.wins -
                      change.previousPerformance.withGear.places}
                  </div>
                  <div className="text-[10px] text-green-600">
                    {(
                      (change.previousPerformance.withGear.wins /
                        change.previousPerformance.withGear.starts) *
                      100
                    ).toFixed(0)}
                    % wins
                  </div>
                </div>
                <div className="p-2 bg-gray-50 border border-gray-200 rounded">
                  <div className="text-[10px] text-gray-700 font-medium mb-0.5">Without Gear</div>
                  <div className="font-bold text-gray-900">
                    {change.previousPerformance.withoutGear.wins}-
                    {change.previousPerformance.withoutGear.places}-
                    {change.previousPerformance.withoutGear.starts -
                      change.previousPerformance.withoutGear.wins -
                      change.previousPerformance.withoutGear.places}
                  </div>
                  <div className="text-[10px] text-gray-600">
                    {(
                      (change.previousPerformance.withoutGear.wins /
                        change.previousPerformance.withoutGear.starts) *
                      100
                    ).toFixed(0)}
                    % wins
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {changes.length === 0 && (
          <div className="px-3 sm:px-4 py-6 text-center text-gray-500 text-sm">
            No gear changes for this race
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-500 text-center border-t border-gray-200">
        Gear changes can significantly impact performance
      </div>
    </motion.div>
  );
}
