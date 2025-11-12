'use client';

import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

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

export default function HeroSection() {
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
        <div className="py-16 border-b border-brand-ui-muted">
          <div className="grid lg:grid-cols-[2fr,1fr] gap-12">

            {/* Featured Content */}
            <div className="flex flex-col justify-between min-w-0">
              <div>
                <h1 className="text-6xl lg:text-7xl font-serif font-bold text-brand-dark-intense mb-8 leading-[1.1] tracking-tight">
                  Compare Live Odds from Australia's Top Bookmakers
                </h1>
                <p className="text-2xl text-brand-dark-muted leading-relaxed mb-10 max-w-2xl font-light">
                  Real-time odds comparison across 10+ bookmakers. Expert insights and AI-powered analysis to help you find the best value on every race.
                </p>
                <div className="flex flex-wrap gap-4 mb-12">
                  <button className="inline-flex items-center justify-center px-10 py-5 bg-brand-primary hover:bg-brand-primary-intense text-white text-sm font-semibold transition-colors cursor-pointer">
                    View Today's Races
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </button>
                  <button className="inline-flex items-center justify-center px-10 py-5 border border-brand-ui-intense hover:border-brand-dark-intense text-sm font-semibold text-brand-dark-intense transition-colors cursor-pointer">
                    Compare Odds
                  </button>
                </div>
              </div>

              {/* Featured Blog Post */}
              <div className="pt-8 border-t border-brand-ui">
                <div className="block">
                  <div className="flex gap-6">
                    <div className="w-36 h-36 bg-brand-light-intense flex-shrink-0 overflow-hidden rounded-md">
                      <Image
                        src="/melbourne-cup.jpg"
                        alt="Melbourne Cup race course"
                        width={144}
                        height={144}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-brand-accent-intense uppercase tracking-wider mb-2">
                        Expert Analysis
                      </div>
                      <h3 className="text-xl font-serif font-bold text-brand-dark-intense mb-2 leading-tight hover:text-brand-primary transition-colors cursor-pointer">
                        Melbourne Cup 2025: Dark Horses and Value Bets to Watch
                      </h3>
                      <p className="text-sm text-brand-dark-muted leading-relaxed line-clamp-2 mb-3">
                        Our racing analysts break down the field and identify the overlooked contenders that could deliver serious returns this year.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-brand-dark-muted">
                        <div className="w-6 h-6 rounded-full bg-brand-light-intense flex-shrink-0 overflow-hidden">
                          <Image
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
                            alt="Sarah Mitchell"
                            width={24}
                            height={24}
                            className="w-full h-full object-cover"
                          />
                        </div>
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
                <div className="partner-showcase border border-brand-ui-muted bg-brand-light-muted overflow-hidden h-[600px]">
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
                      <div className="font-bold text-lg"><CountdownTimer targetTime={race1Time} /></div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <div className="mb-3">
                    <div className="text-xs text-brand-dark-muted mb-1">FAVOURITE</div>
                    <div className="font-semibold text-brand-dark-intense text-lg">Thunder Bolt</div>
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
                      <div className="font-bold text-lg"><CountdownTimer targetTime={race2Time} /></div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <div className="mb-3">
                    <div className="text-xs text-brand-dark-muted mb-1">FAVOURITE</div>
                    <div className="font-semibold text-brand-dark-intense text-lg">Lightning Strike</div>
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
                      <div className="font-bold text-lg"><CountdownTimer targetTime={race3Time} /></div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <div className="mb-3">
                    <div className="text-xs text-brand-dark-muted mb-1">FAVOURITE</div>
                    <div className="font-semibold text-brand-dark-intense text-lg">Storm Chaser</div>
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
