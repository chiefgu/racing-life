'use client';

import { motion } from 'framer-motion';
import { MapPin, TrendingUp, TrendingDown } from 'lucide-react';

interface BiasIndicator {
  category: string;
  bias: 'favorable' | 'neutral' | 'unfavorable';
  description: string;
}

interface TrackBiasWidgetProps {
  track: string;
  date: string;
  railPosition: string;
  weatherCondition: string;
  trackRating: string;
  biases: BiasIndicator[];
  recommendation: string;
}

export default function TrackBiasWidget({
  track,
  date,
  railPosition,
  weatherCondition,
  trackRating,
  biases,
  recommendation,
}: TrackBiasWidgetProps) {
  const getBiasIcon = (bias: string) => {
    if (bias === 'favorable') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (bias === 'unfavorable') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
  };

  const getBiasColor = (bias: string) => {
    if (bias === 'favorable') return 'bg-green-50 border-green-500';
    if (bias === 'unfavorable') return 'bg-red-50 border-red-500';
    return 'bg-gray-50 border-gray-400';
  };

  const getBiasTextColor = (bias: string) => {
    if (bias === 'favorable') return 'text-green-900';
    if (bias === 'unfavorable') return 'text-red-900';
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
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <h4 className="font-bold text-sm sm:text-base truncate">Track Bias</h4>
            </div>
            <p className="text-[10px] sm:text-xs text-white/80 truncate">
              {track} · {date}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] sm:text-xs text-white/80">Rating</div>
            <div className="text-lg sm:text-2xl font-bold whitespace-nowrap">{trackRating}</div>
          </div>
        </div>
      </div>

      {/* Track Conditions */}
      <div className="grid grid-cols-2 gap-px bg-gray-200">
        <div className="bg-blue-50 px-3 py-3 border-l-4 border-blue-500">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Rail Position
          </div>
          <div className="text-base sm:text-lg font-bold text-gray-900">{railPosition}</div>
        </div>
        <div className="bg-sky-50 px-3 py-3 border-l-4 border-sky-500">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Conditions
          </div>
          <div className="text-base sm:text-lg font-bold text-gray-900">{weatherCondition}</div>
        </div>
      </div>

      {/* Bias Indicators */}
      <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-3">
        {biases.map((bias, index) => (
          <div key={index} className={`p-3 border-l-4 ${getBiasColor(bias.bias)}`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{getBiasIcon(bias.bias)}</div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-bold mb-1 ${getBiasTextColor(bias.bias)}`}>
                  {bias.category}
                </div>
                <div className="text-xs sm:text-sm text-gray-700">{bias.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div className="mx-3 sm:mx-4 mb-3 sm:mb-4 p-3 bg-purple-50 border-l-4 border-purple-500">
        <div className="text-sm text-gray-900">
          <span className="font-bold">Recommendation: </span>
          {recommendation}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-500 text-center border-t border-gray-200">
        Based on recent results and track conditions
      </div>
    </motion.div>
  );
}
