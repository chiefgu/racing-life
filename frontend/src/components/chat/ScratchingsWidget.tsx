'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, UserX, RefreshCw, Clock } from 'lucide-react';

interface Scratching {
  horseName: string;
  horseNumber: number;
  reason: string;
  timeScratched: string;
  wasBackedFrom?: number;
  wasBackedTo?: number;
}

interface RiderChange {
  horseName: string;
  horseNumber: number;
  previousJockey: string;
  newJockey: string;
  reason: string;
  impact: 'positive' | 'negative' | 'neutral';
}

interface LateChange {
  type: 'barrier' | 'weight' | 'gear' | 'emergency';
  horseName: string;
  horseNumber: number;
  description: string;
  significance: 'high' | 'medium' | 'low';
}

interface ScratchingsWidgetProps {
  race: string;
  lastUpdated: string;
  scratchings: Scratching[];
  riderChanges: RiderChange[];
  lateChanges: LateChange[];
}

export default function ScratchingsWidget({
  race,
  lastUpdated,
  scratchings,
  riderChanges,
  lateChanges,
}: ScratchingsWidgetProps) {
  const totalChanges = scratchings.length + riderChanges.length + lateChanges.length;

  const getImpactColor = (impact: string) => {
    if (impact === 'positive') return 'text-green-600';
    if (impact === 'negative') return 'text-red-600';
    return 'text-gray-600';
  };

  const getSignificanceBadge = (significance: string) => {
    if (significance === 'high')
      return (
        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded font-medium">
          Important
        </span>
      );
    return null;
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
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <h4 className="font-bold text-sm sm:text-base truncate">Late Changes</h4>
            </div>
            <p className="text-[10px] sm:text-xs text-white/80 truncate">{race}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] sm:text-xs text-white/80">Updates</div>
            <div className="text-lg sm:text-2xl font-bold whitespace-nowrap">{totalChanges}</div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="px-3 sm:px-4 py-2 bg-blue-50 border-b border-blue-200">
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-blue-900">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-medium">Last updated: {lastUpdated}</span>
        </div>
      </div>

      {/* Scratchings Section */}
      {scratchings.length > 0 && (
        <div className="border-b border-gray-200">
          <div className="px-3 sm:px-4 py-2 bg-gray-50">
            <div className="flex items-center gap-1.5">
              <UserX className="w-4 h-4 text-red-600" />
              <h5 className="text-xs sm:text-sm font-bold text-red-900 uppercase tracking-wide">
                Scratchings ({scratchings.length})
              </h5>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {scratchings.map((scratching, index) => (
              <div key={index} className="px-3 sm:px-4 py-2 sm:py-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 line-through">
                    {scratching.horseNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-xs sm:text-sm mb-1">
                      {scratching.horseName}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-700 mb-1">
                      <span className="font-medium">Reason:</span> {scratching.reason}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-600">
                      <span>{scratching.timeScratched}</span>
                      {scratching.wasBackedFrom && scratching.wasBackedTo && (
                        <span className="text-orange-600 font-medium">
                          Was ${scratching.wasBackedFrom} → ${scratching.wasBackedTo}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rider Changes Section */}
      {riderChanges.length > 0 && (
        <div className="border-b border-gray-200">
          <div className="px-3 sm:px-4 py-2 bg-gray-50">
            <div className="flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-orange-600" />
              <h5 className="text-xs sm:text-sm font-bold text-orange-900 uppercase tracking-wide">
                Rider Changes ({riderChanges.length})
              </h5>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {riderChanges.map((change, index) => (
              <div key={index} className="px-3 sm:px-4 py-2 sm:py-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {change.horseNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-xs sm:text-sm mb-1">
                      {change.horseName}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-700 mb-1">
                      <span className="line-through">{change.previousJockey}</span>
                      <span className="mx-1.5">→</span>
                      <span className={`font-bold ${getImpactColor(change.impact)}`}>
                        {change.newJockey}
                      </span>
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-600">
                      <span className="font-medium">Reason:</span> {change.reason}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Late Changes Section */}
      {lateChanges.length > 0 && (
        <div className="border-b border-gray-200">
          <div className="px-3 sm:px-4 py-2 bg-gray-50">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <h5 className="text-xs sm:text-sm font-bold text-yellow-900 uppercase tracking-wide">
                Other Changes ({lateChanges.length})
              </h5>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {lateChanges.map((change, index) => (
              <div key={index} className="px-3 sm:px-4 py-2 sm:py-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {change.horseNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-bold text-gray-900 text-xs sm:text-sm">
                        {change.horseName}
                      </div>
                      {getSignificanceBadge(change.significance)}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-700">
                      <span className="font-medium capitalize">{change.type} Change:</span>{' '}
                      {change.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Changes */}
      {totalChanges === 0 && (
        <div className="px-3 sm:px-4 py-6 text-center">
          <div className="text-green-600 mb-2">
            <Clock className="w-8 h-8 mx-auto" />
          </div>
          <div className="text-sm font-medium text-gray-900 mb-1">No Late Changes</div>
          <div className="text-xs text-gray-600">All horses and jockeys confirmed</div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-50 px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-500 text-center border-t border-gray-200">
        Check back regularly for updates · Changes can occur right up to jump time
      </div>
    </motion.div>
  );
}
