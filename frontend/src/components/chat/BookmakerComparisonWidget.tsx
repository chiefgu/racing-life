'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star, Gift, ExternalLink } from 'lucide-react';

interface Bookmaker {
  name: string;
  logo: string;
  rating: number; // 0-5
  signUpBonus: string;
  features: string[];
  pros: string[];
  url: string;
}

interface BookmakerComparisonWidgetProps {
  bookmakers: Bookmaker[];
}

export default function BookmakerComparisonWidget({ bookmakers }: BookmakerComparisonWidgetProps) {
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
            <h4 className="font-bold text-sm sm:text-base truncate">Bookmaker Comparison</h4>
            <p className="text-[10px] sm:text-xs text-white/80 truncate">
              Find the best bookmaker for you
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] sm:text-xs text-white/80">Comparing</div>
            <div className="text-lg sm:text-2xl font-bold whitespace-nowrap">
              {bookmakers.length}
            </div>
          </div>
        </div>
      </div>

      {/* Bookmaker Cards */}
      <div className="divide-y divide-gray-200">
        {bookmakers.map((bookie, index) => (
          <div key={index} className="px-3 sm:px-4 py-4 sm:py-5">
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-20 h-12 sm:w-24 sm:h-14 bg-gray-50 border border-gray-200 flex items-center justify-center p-2 flex-shrink-0">
                <Image
                  src={bookie.logo}
                  alt={bookie.name}
                  width={88}
                  height={52}
                  className="object-contain"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h5 className="font-bold text-gray-900 text-base sm:text-lg mb-2">{bookie.name}</h5>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(bookie.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                  <span className="text-sm font-semibold text-gray-700 ml-1">
                    {bookie.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              <a
                href={bookie.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 px-4 py-2 bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary-intense transition-colors"
              >
                Visit Site
              </a>
            </div>

            {/* Sign Up Bonus */}
            <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-green-700 flex-shrink-0" />
                <span className="text-sm font-semibold text-green-900">{bookie.signUpBonus}</span>
              </div>
            </div>

            {/* Features */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Features
              </div>
              <div className="flex flex-wrap gap-2">
                {bookie.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 border border-gray-200"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Pros */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Why {bookie.name}
              </div>
              <ul className="space-y-1">
                {bookie.pros.map((pro, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-green-600 flex-shrink-0">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-500 text-center border-t border-gray-200">
        18+ · Gamble responsibly · Terms and conditions apply
      </div>
    </motion.div>
  );
}
