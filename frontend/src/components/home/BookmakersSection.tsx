'use client';

import { Star } from 'lucide-react';

const bookmakerOffers = [
  {
    id: 'tab',
    name: 'TAB',
    offer: 'Bet $50, Get $50 in Bonus Bets',
    terms: 'New customers only. Min deposit $50. T&Cs apply.',
    rating: 4.5,
    reviews: 1243,
    highlights: ['Best Tote Dividends', 'Live Race Streaming', 'Same Day Withdrawals'],
  },
  {
    id: 'sportsbet',
    name: 'Sportsbet',
    offer: '$100 Deposit Match + $50 Bonus',
    terms: 'New members. Deposit $100, bet $100. T&Cs apply.',
    rating: 4.3,
    reviews: 2156,
    highlights: ['Power Play Features', 'Quick Deposits', 'Mobile App Excellence'],
  },
  {
    id: 'ladbrokes',
    name: 'Ladbrokes',
    offer: 'Bet $50, Get $200 in Bonus Bets',
    terms: 'New customers. Min odds 1.50. T&Cs apply.',
    rating: 4.4,
    reviews: 987,
    highlights: ['Consistent Best Odds', 'Daily Price Boosts', 'Expert Tips'],
  },
  {
    id: 'neds',
    name: 'Neds',
    offer: 'Up to $250 in Bonus Bets',
    terms: 'New members only. Turnover requirements apply.',
    rating: 4.2,
    reviews: 1567,
    highlights: ['Neds Toolbox Analytics', 'Fast Payouts', 'Comprehensive Markets'],
  },
];

export default function BookmakersSection() {
  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-12 pb-6 border-b border-gray-900">
          <div>
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-2">
              Exclusive Bookmaker Offers
            </h2>
            <p className="text-gray-600">
              Sign up through Racing Life for exclusive bonuses from Australia's top bookmakers
            </p>
          </div>
          <span className="text-sm font-semibold text-gray-900 border-b border-gray-900 cursor-default">
            View all bookmakers →
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {bookmakerOffers.slice(0, 3).map((bookmaker) => (
            <div
              key={bookmaker.id}
              className="bg-gray-50 border-2 border-gray-200 hover:border-gray-900 transition-all group"
            >
              {/* Header with Logo & Offer */}
              <div className="bg-white border-b-2 border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-white">{bookmaker.name.substring(0, 3)}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {bookmaker.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(bookmaker.rating)
                                  ? 'fill-gray-900 text-gray-900'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">{bookmaker.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wider">
                    Exclusive
                  </div>
                </div>

                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {bookmaker.offer}
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  {bookmaker.terms}
                </p>
              </div>

              {/* Features & CTA */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {bookmaker.highlights.slice(0, 4).map((highlight) => (
                    <div key={highlight} className="flex items-start gap-2">
                      <div className="w-4 h-4 bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span className="text-xs text-gray-700 font-medium leading-tight">{highlight}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    className="flex-1 text-center px-6 py-3 bg-black text-white text-sm font-bold cursor-default"
                  >
                    Get Bonus
                  </button>
                  <button
                    className="px-6 py-3 border-2 border-gray-900 text-sm font-semibold text-gray-900 cursor-default"
                  >
                    Review
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  18+ · T&Cs Apply · Gamble Responsibly
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-gray-500 mb-6">
            Racing Life is compensated when you sign up through our links. This helps us provide free racing coverage.
          </p>
        </div>
      </div>
    </section>
  );
}
