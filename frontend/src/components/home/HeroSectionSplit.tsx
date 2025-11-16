'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

function CountdownTimer({ targetTime }: { targetTime: Date }) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const difference = targetTime.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft('LIVE NOW');
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
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  return <span>{timeLeft}</span>;
}

export default function HeroSectionSplit() {
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
                {/* Story 1 - Next to Jump */}
                <div className="border-l-4 border-brand-primary pl-4">
                  <div className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-2">
                    Next to Jump
                  </div>
                  <h3 className="text-xl font-serif font-bold text-brand-dark-intense mb-2 leading-tight hover:text-brand-primary transition-colors cursor-pointer">
                    Thunder Bolt Firm Favourite at Flemington
                  </h3>
                  <p className="text-sm text-brand-dark-muted mb-3 line-clamp-2">
                    Race 4 jumps in{' '}
                    <span className="font-bold text-brand-primary">
                      <CountdownTimer targetTime={race1Time} />
                    </span>
                    . Best odds $3.50 at Sportsbet.
                  </p>
                  <div className="text-xs text-brand-dark-muted">1400m · Good 4 · 12 runners</div>
                </div>

                {/* Story 2 - Odds Movement */}
                <div className="border-l-4 border-green-600 pl-4">
                  <div className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">
                    Market Mover
                  </div>
                  <h3 className="text-xl font-serif font-bold text-brand-dark-intense mb-2 leading-tight hover:text-brand-primary transition-colors cursor-pointer">
                    Lightning Strike Backed In Heavily
                  </h3>
                  <p className="text-sm text-brand-dark-muted mb-3">
                    Randwick runner has firmed from $5.20 to $4.20 in the last hour on strong money.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm line-through text-brand-dark-muted">$5.20</span>
                    <span className="text-lg font-bold text-green-600">$4.20</span>
                  </div>
                </div>

                {/* Story 3 - Analysis */}
                <div className="border-l-4 border-brand-accent-intense pl-4">
                  <div className="text-xs font-bold text-brand-accent-intense uppercase tracking-wider mb-2">
                    Expert Analysis
                  </div>
                  <h3 className="text-xl font-serif font-bold text-brand-dark-intense mb-2 leading-tight hover:text-brand-primary transition-colors cursor-pointer">
                    Jockey Form Guide: Who's Hot This Week
                  </h3>
                  <p className="text-sm text-brand-dark-muted mb-3 line-clamp-2">
                    J. Smith continues dominant run with three wins from five starts. Our AI
                    analysis reveals key trends.
                  </p>
                  <div className="text-xs text-brand-dark-muted">
                    By Tom Richardson · 4 hours ago
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Advertisement Banner */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <div className="border border-brand-ui-muted bg-brand-light-muted overflow-hidden h-[600px]">
                  <div className="h-full p-8 flex flex-col items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-brand-dark-intense mx-auto mb-6 flex items-center justify-center">
                        <div className="text-white text-2xl font-bold">RL</div>
                      </div>
                      <div className="text-sm font-semibold text-brand-dark-intense uppercase tracking-wider">
                        Premium Partner
                      </div>
                      <div className="text-xs text-brand-dark-muted max-w-[200px]">
                        Your content here
                      </div>
                    </div>
                  </div>
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
          </div>
        </div>
      </div>
    </section>
  );
}
