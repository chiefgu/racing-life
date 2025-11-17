'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp } from 'lucide-react';
import AnimatedOrb from '@/components/shared/AnimatedOrb';
import { Shimmer } from '@/components/ui/Shimmer';

function CountdownTimer({ targetTime }: { targetTime: Date }) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(true);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const difference = targetTime.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft('LIVE NOW');
        setIsCalculating(false);
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }

      setIsCalculating(false);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  if (isCalculating) {
    return <span className="text-brand-dark-muted/50">--:--</span>;
  }

  return <span>{timeLeft}</span>;
}

export default function HeroSectionSplit() {
  // Loading states
  const [isLoadingMarketMovers, setIsLoadingMarketMovers] = useState(true);
  const [isLoadingRaces, setIsLoadingRaces] = useState(true);

  // Create target times (using today's date with specific times)
  const now = new Date();

  const race1Time = new Date(now);
  race1Time.setHours(14, 15, 0, 0); // 2:15 PM
  if (race1Time < now) race1Time.setDate(race1Time.getDate() + 1);

  const race2Time = new Date(now);
  race2Time.setHours(14, 45, 0, 0); // 2:45 PM
  if (race2Time < now) race2Time.setDate(race2Time.getDate() + 1);

  const race3Time = new Date(now);
  race3Time.setHours(15, 20, 0, 0); // 3:20 PM
  if (race3Time < now) race3Time.setDate(race3Time.getDate() + 1);

  // Simulate data loading
  useEffect(() => {
    // Simulate market movers loading (in production, this would be an API call)
    const marketMoversTimer = setTimeout(() => {
      setIsLoadingMarketMovers(false);
    }, 1500);

    // Simulate race data loading (in production, this would be an API call)
    const racesTimer = setTimeout(() => {
      setIsLoadingRaces(false);
    }, 1200);

    return () => {
      clearTimeout(marketMoversTimer);
      clearTimeout(racesTimer);
    };
  }, []);

  return (
    <section className="bg-white">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Main Hero Area */}
        <div className="py-12 border-b border-brand-ui-muted">
          <div className="grid lg:grid-cols-[2fr,1fr] gap-12">
            {/* Left: News-style Layout */}
            <div>
              {/* Main Featured Story */}
              <div className="mb-8 pb-8 border-b border-brand-ui">
                <div className="grid md:grid-cols-[1fr,1.5fr] gap-6">
                  <div className="aspect-[4/3] bg-brand-light-intense overflow-hidden">
                    <Image
                      src="/melbourne-cup.jpg"
                      alt="Melbourne Cup"
                      width={600}
                      height={450}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-3">
                      Featured Story
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-serif font-bold text-brand-dark-intense mb-4 leading-tight hover:text-brand-primary transition-colors cursor-pointer">
                      Melbourne Cup 2025: Dark Horses Set to Upset Favourites
                    </h1>
                    <p className="text-lg text-brand-dark-muted leading-relaxed mb-4">
                      Our analysts break down the overlooked contenders that could deliver serious
                      returns in this year's race that stops a nation.
                    </p>
                    <div className="flex items-center gap-3 text-sm text-brand-dark-muted">
                      <div className="w-8 h-8 rounded-full bg-brand-light-intense overflow-hidden">
                        <Image
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
                          alt="Sarah Mitchell"
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-medium">Sarah Mitchell</span>
                      <span>·</span>
                      <span>2 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Stories Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Story 1 - AI Racing Analyst */}
                <div className="border-l-4 border-gray-300 pl-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex-shrink-0">
                      <AnimatedOrb size="tiny" energy={0} />
                    </div>
                    <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      AI Racing Analyst
                    </div>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-brand-dark-intense mb-2 leading-tight hover:text-brand-primary transition-colors cursor-pointer">
                    Your Personal AI-Powered Racing Intelligence
                  </h3>
                  <p className="text-sm text-brand-dark-muted mb-3">
                    Stay informed with real-time alerts and personalised insights on your favourite
                    horses, jockeys, and trainers.
                  </p>
                  <a
                    href="/onboarding"
                    className="text-xs text-brand-dark-intense font-semibold hover:text-brand-primary transition-colors inline-block"
                  >
                    Build Your Analyst →
                  </a>
                </div>

                {/* Story 2 - Market Movers */}
                <div className="border-l-4 border-gray-300 pl-4">
                  {isLoadingMarketMovers ? (
                    <div className="flex flex-col gap-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-1.5">
                          <Shimmer className="h-4 w-20 mb-2" />
                          <Shimmer className="h-5 w-32 mb-1" />
                          <div className="flex justify-between items-center">
                            <Shimmer className="h-3 w-28" />
                            <Shimmer className="h-5 w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {/* Market Steamer 1 */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingDown className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-bold text-green-600 uppercase tracking-wider">
                            Steamer
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-baseline justify-between">
                            <a
                              href="#race-randwick-r6"
                              className="text-base font-bold text-brand-dark-intense hover:text-brand-primary transition-colors"
                            >
                              Lightning Strike
                            </a>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-brand-dark-muted line-through">
                                $5.20
                              </span>
                              <span className="text-sm font-bold text-green-600">$4.20</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <a
                              href="#race-randwick-r6"
                              className="text-xs text-brand-dark-muted hover:text-brand-primary transition-colors"
                            >
                              Randwick R6 · 1200m
                            </a>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-brand-dark-muted">Best</span>
                              <a
                                href="#race-randwick-r6"
                                className="w-10 h-5 bg-white rounded flex items-center justify-center p-0.5 hover:opacity-80 transition-opacity"
                              >
                                <Image
                                  src="/logos/sportsbet.jpeg"
                                  alt="Sportsbet"
                                  width={28}
                                  height={14}
                                  className="object-contain"
                                />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Market Steamer 2 */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingDown className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-bold text-green-600 uppercase tracking-wider">
                            Steamer
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-baseline justify-between">
                            <a
                              href="#race-caulfield-r8"
                              className="text-base font-bold text-brand-dark-intense hover:text-brand-primary transition-colors"
                            >
                              Golden Arrow
                            </a>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-brand-dark-muted line-through">
                                $7.50
                              </span>
                              <span className="text-sm font-bold text-green-600">$6.20</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <a
                              href="#race-caulfield-r8"
                              className="text-xs text-brand-dark-muted hover:text-brand-primary transition-colors"
                            >
                              Caulfield R8 · 2400m
                            </a>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-brand-dark-muted">Best</span>
                              <a
                                href="#race-caulfield-r8"
                                className="w-10 h-5 bg-white rounded flex items-center justify-center p-0.5 hover:opacity-80 transition-opacity"
                              >
                                <Image
                                  src="/logos/ladbrokes.png"
                                  alt="Ladbrokes"
                                  width={28}
                                  height={14}
                                  className="object-contain"
                                />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-brand-ui"></div>

                      {/* Market Drifter */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingUp className="w-4 h-4 text-red-600" />
                          <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                            Drifter
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-baseline justify-between">
                            <a
                              href="#race-flemington-r4"
                              className="text-base font-bold text-brand-dark-intense hover:text-brand-primary transition-colors"
                            >
                              Storm Warning
                            </a>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-brand-dark-muted line-through">
                                $3.80
                              </span>
                              <span className="text-sm font-bold text-red-600">$4.60</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <a
                              href="#race-flemington-r4"
                              className="text-xs text-brand-dark-muted hover:text-brand-primary transition-colors"
                            >
                              Flemington R4 · 1400m
                            </a>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-brand-dark-muted">Best</span>
                              <a
                                href="#race-flemington-r4"
                                className="w-10 h-5 bg-white rounded flex items-center justify-center p-0.5 hover:opacity-80 transition-opacity"
                              >
                                <Image
                                  src="/logos/tab.png"
                                  alt="TAB"
                                  width={28}
                                  height={14}
                                  className="object-contain"
                                />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Story 3 - Analysis */}
                <div className="border-l-4 border-gray-300 pl-4">
                  <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                    Expert Analysis
                  </div>
                  <h3 className="text-xl font-serif font-bold text-brand-dark-intense mb-2 leading-tight hover:text-brand-primary transition-colors cursor-pointer">
                    Jockey Form Guide: Who's Hot This Week
                  </h3>
                  <p className="text-sm text-brand-dark-muted mb-3">
                    J. Smith continues dominant run with three wins from five starts across
                    metropolitan tracks. Our analysis highlights strong performance on soft ground
                    conditions.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-brand-dark-muted">
                    <div className="w-6 h-6 rounded-full bg-brand-light-intense overflow-hidden">
                      <Image
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                        alt="Tom Richardson"
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-medium">Tom Richardson</span>
                    <span>·</span>
                    <span>4 hours ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Advertisement Banner */}
            <div className="hidden lg:flex lg:justify-end">
              <div className="sticky top-24">
                <div className="border border-brand-ui-muted overflow-hidden bg-white inline-block h-[600px]">
                  <Image
                    src="/tab-advert.png"
                    alt="TAB Advertisement"
                    width={400}
                    height={600}
                    className="h-full w-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6">
        {/* Live Odds Strip */}
        <div className="py-8 border-b border-brand-ui-muted">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-brand-dark-intense uppercase tracking-wide">
              Next to Jump
            </h2>
            <span className="text-sm font-medium text-brand-dark-intense hover:text-brand-primary-intense border-b border-brand-dark-intense hover:border-brand-primary-intense cursor-pointer transition-colors">
              View all races →
            </span>
          </div>

          {/* Horizontal Scrolling Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {isLoadingRaces ? (
              // Loading skeleton for race cards
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-brand-ui rounded-lg overflow-hidden">
                    <div className="bg-brand-light-intense px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <Shimmer className="h-3 w-24" />
                          <Shimmer className="h-4 w-32" />
                        </div>
                        <div className="space-y-2">
                          <Shimmer className="h-3 w-16" />
                          <Shimmer className="h-5 w-20" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-white">
                      <div className="mb-3">
                        <Shimmer className="h-3 w-20 mb-2" />
                        <Shimmer className="h-5 w-28" />
                      </div>
                      <div className="flex items-end justify-between">
                        <div className="space-y-2">
                          <Shimmer className="h-3 w-16" />
                          <Shimmer className="h-7 w-16" />
                        </div>
                        <div className="space-y-2">
                          <Shimmer className="h-3 w-20" />
                          <Shimmer className="h-7 w-14" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {/* Race Card 1 */}
                <div className="group cursor-default">
                  <div className="border border-brand-ui hover:border-brand-ui-intense transition-colors rounded-lg overflow-hidden">
                    <div className="bg-brand-secondary text-white px-4 py-3 animate-pulse-subtle">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs opacity-75 mb-1">FLEMINGTON · R4</div>
                          <div className="font-semibold">1400m · Good 4</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs opacity-75 mb-1">STARTS IN</div>
                          <div className="font-bold text-lg">
                            <CountdownTimer targetTime={race1Time} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-white">
                      <div className="mb-3">
                        <div className="text-xs text-brand-dark-muted mb-1">FAVOURITE</div>
                        <div className="font-semibold text-brand-dark-intense text-lg">
                          Thunder Bolt
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-xs text-brand-dark-muted mb-1">BEST ODDS</div>
                          <div className="text-2xl font-bold text-brand-accent-intense">$3.50</div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-xs text-brand-dark-muted">BOOKMAKER</div>
                          <div className="w-14 h-7 bg-white rounded-md flex items-center justify-center p-1">
                            <Image
                              src="/logos/tab.png"
                              alt="TAB"
                              width={40}
                              height={20}
                              className="object-contain rounded"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Race Card 2 */}
                <div className="group cursor-default">
                  <div className="border border-brand-ui hover:border-brand-ui-intense transition-colors rounded-lg overflow-hidden">
                    <div className="bg-brand-primary text-white px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs opacity-75 mb-1">RANDWICK · R6</div>
                          <div className="font-semibold">1200m · Soft 5</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs opacity-75 mb-1">STARTS IN</div>
                          <div className="font-bold text-lg">
                            <CountdownTimer targetTime={race2Time} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-white">
                      <div className="mb-3">
                        <div className="text-xs text-brand-dark-muted mb-1">FAVOURITE</div>
                        <div className="font-semibold text-brand-dark-intense text-lg">
                          Lightning Strike
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-xs text-brand-dark-muted mb-1">BEST ODDS</div>
                          <div className="text-2xl font-bold text-brand-accent-intense">$4.20</div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-xs text-brand-dark-muted">BOOKMAKER</div>
                          <div className="w-14 h-7 bg-white rounded-md flex items-center justify-center p-1">
                            <Image
                              src="/logos/sportsbet.jpeg"
                              alt="Sportsbet"
                              width={40}
                              height={20}
                              className="object-contain rounded"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Race Card 3 */}
                <div className="group cursor-default">
                  <div className="border border-brand-ui hover:border-brand-ui-intense transition-colors rounded-lg overflow-hidden">
                    <div className="bg-brand-primary text-white px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs opacity-75 mb-1">CAULFIELD · R8</div>
                          <div className="font-semibold">2400m · Good 3</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs opacity-75 mb-1">STARTS IN</div>
                          <div className="font-bold text-lg">
                            <CountdownTimer targetTime={race3Time} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-white">
                      <div className="mb-3">
                        <div className="text-xs text-brand-dark-muted mb-1">FAVOURITE</div>
                        <div className="font-semibold text-brand-dark-intense text-lg">
                          Storm Chaser
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-xs text-brand-dark-muted mb-1">BEST ODDS</div>
                          <div className="text-2xl font-bold text-brand-accent-intense">$5.50</div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-xs text-brand-dark-muted">BOOKMAKER</div>
                          <div className="w-14 h-7 bg-white rounded-md flex items-center justify-center p-1">
                            <Image
                              src="/logos/ladbrokes.png"
                              alt="Ladbrokes"
                              width={40}
                              height={20}
                              className="object-contain rounded"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
