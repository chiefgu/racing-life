'use client';

import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="bg-white">
      <div className="max-w-[1400px] mx-auto px-6">

        {/* Main Hero Area */}
        <div className="py-16 border-b border-gray-900">
          <div className="grid lg:grid-cols-[2fr,1fr] gap-12">

            {/* Featured Content */}
            <div className="flex flex-col justify-between min-w-0">
              <div>
                <div className="inline-block mb-4 px-3 py-1 bg-black text-white text-xs font-semibold uppercase tracking-wider">
                  Featured
                </div>
                <h1 className="text-6xl lg:text-7xl font-serif font-bold text-gray-900 mb-8 leading-[1.1] tracking-tight">
                  Compare Live Odds from Australia's Top Bookmakers
                </h1>
                <p className="text-2xl text-gray-700 leading-relaxed mb-10 max-w-2xl font-light">
                  Real-time odds comparison across 10+ bookmakers. Expert insights and AI-powered analysis to help you find the best value on every race.
                </p>
                <div className="flex flex-wrap gap-4 mb-12">
                  <button className="inline-flex items-center justify-center px-10 py-5 bg-black text-white text-sm font-semibold cursor-default">
                    View Today's Races
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </button>
                  <button className="inline-flex items-center justify-center px-10 py-5 border-2 border-gray-900 text-sm font-semibold text-gray-900 cursor-default">
                    Compare Odds
                  </button>
                </div>
              </div>

              {/* Featured Blog Post */}
              <div className="pt-8 border-t border-gray-300">
                <div className="block">
                  <div className="flex gap-6">
                    <div className="w-32 h-32 bg-gray-200 flex-shrink-0 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Expert Analysis
                      </div>
                      <h3 className="text-xl font-serif font-bold text-gray-900 mb-2 leading-tight">
                        Melbourne Cup 2025: Dark Horses and Value Bets to Watch
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">
                        Our racing analysts break down the field and identify the overlooked contenders that could deliver serious returns this year.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-6 h-6 rounded-full bg-gray-300 flex-shrink-0"></div>
                        <span className="font-medium">Sarah Mitchell</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="hidden lg:block min-w-0">
              <div className="sticky top-24">
                <div className="partner-showcase border border-gray-300 bg-white shadow-sm overflow-hidden h-[600px]">
                  <div className="h-full bg-gradient-to-br from-gray-50 to-white p-8 flex flex-col items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-gray-900 mx-auto mb-6 flex items-center justify-center">
                        <div className="text-white text-2xl font-bold">RL</div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Premium Partner
                      </div>
                      <div className="text-xs text-gray-500 max-w-[200px]">
                        Your content here
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Odds Strip */}
        <div className="py-8 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 uppercase tracking-wide">
              Next to Jump
            </h2>
            <span className="text-sm font-semibold text-gray-900 border-b border-gray-900 cursor-default">
              View all races →
            </span>
          </div>

          {/* Horizontal Scrolling Cards */}
          <div className="grid md:grid-cols-3 gap-6">

            {/* Race Card 1 */}
            <div className="group cursor-default">
              <div className="border border-gray-200">
                <div className="bg-gray-900 text-white px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs opacity-75 mb-1">FLEMINGTON · R4</div>
                      <div className="font-semibold">1400m · Good 4</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs opacity-75 mb-1">STARTS</div>
                      <div className="font-bold text-lg">2:15 PM</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">FAVOURITE</div>
                    <div className="font-semibold text-gray-900 text-lg">Thunder Bolt</div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">BEST ODDS</div>
                      <div className="text-2xl font-bold text-gray-900">$3.50</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-xs text-gray-500 mb-1">BOOKMAKER</div>
                      <div className="w-8 h-8 bg-gray-900 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">TAB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Race Card 2 */}
            <div className="group cursor-default">
              <div className="border border-gray-200">
                <div className="bg-gray-900 text-white px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs opacity-75 mb-1">RANDWICK · R6</div>
                      <div className="font-semibold">1200m · Soft 5</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs opacity-75 mb-1">STARTS</div>
                      <div className="font-bold text-lg">2:45 PM</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">FAVOURITE</div>
                    <div className="font-semibold text-gray-900 text-lg">Lightning Strike</div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">BEST ODDS</div>
                      <div className="text-2xl font-bold text-gray-900">$4.20</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-xs text-gray-500 mb-1">BOOKMAKER</div>
                      <div className="w-8 h-8 bg-gray-900 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">SPT</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Race Card 3 */}
            <div className="group cursor-default">
              <div className="border border-gray-200">
                <div className="bg-gray-900 text-white px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs opacity-75 mb-1">CAULFIELD · R8</div>
                      <div className="font-semibold">2400m · Good 3</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs opacity-75 mb-1">STARTS</div>
                      <div className="font-bold text-lg">3:20 PM</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">FAVOURITE</div>
                    <div className="font-semibold text-gray-900 text-lg">Storm Chaser</div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">BEST ODDS</div>
                      <div className="text-2xl font-bold text-gray-900">$5.50</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-xs text-gray-500 mb-1">BOOKMAKER</div>
                      <div className="w-8 h-8 bg-gray-900 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">LAD</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
