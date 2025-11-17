'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

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

const carouselContent = [
  {
    id: 'odds-comparison',
    label: 'Live Odds',
    headline: "Compare Live Odds from Australia's Top Bookmakers",
    subheadline: 'Never miss the best price. Updated every second.',
    description:
      'TAB, Sportsbet, Ladbrokes, Neds and more—all in one place. Our odds update every second so you always get the best value.',
    stats: [
      { value: '10+', label: 'Bookmakers' },
      { value: 'Live', label: 'Real-Time' },
    ],
    color: 'brand-primary',
  },
  {
    id: 'ai-analyst',
    label: 'AI Analyst',
    headline: 'AI-Powered Analysis Personalised to Your Racing Favourites',
    subheadline: 'Your personal racing analyst, working 24/7',
    description:
      'Get personalised tips and analysis for your favourite jockeys, trainers and tracks. Our AI tracks news sentiment and form to give you an edge.',
    stats: [
      { value: 'AI', label: 'Powered Insights' },
      { value: '24/7', label: 'Analysis' },
    ],
    color: 'brand-accent-intense',
  },
  {
    id: 'ambassadors',
    label: 'Ambassadors',
    headline: "Expert Tips from Australia's Top Racing Minds",
    subheadline: 'Decades of racing experience at your fingertips',
    description:
      'Our ambassadors bring insider knowledge and exclusive tips. Get track insights, form analysis, and winning strategies from the pros.',
    stats: [
      { value: '5+', label: 'Racing Experts' },
      { value: 'Daily', label: 'Insights' },
    ],
    color: 'brand-secondary',
  },
];

export default function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [hasViewedAll, setHasViewedAll] = useState(false);
  const [viewedCards, setViewedCards] = useState<Set<number>>(new Set([0]));
  const isScrollingRef = useRef(false);

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

  // Check if all cards have been viewed
  useEffect(() => {
    if (viewedCards.size === carouselContent.length) {
      setHasViewedAll(true);
    }
  }, [viewedCards]);

  // Lock scroll until all cards viewed
  useEffect(() => {
    if (!hasViewedAll) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      // Re-enable scroll
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [hasViewedAll]);

  // Handle scroll-based navigation
  useEffect(() => {
    if (hasViewedAll) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (isScrollingRef.current) return;

      isScrollingRef.current = true;

      if (e.deltaY > 0) {
        // Scrolling down - next card
        setActiveIndex((prev) => {
          const next = Math.min(prev + 1, carouselContent.length - 1);
          if (next !== prev) {
            setDirection(1);
            setViewedCards((viewed) => new Set(viewed).add(next));
          }
          return next;
        });
      } else if (e.deltaY < 0) {
        // Scrolling up - previous card
        setActiveIndex((prev) => {
          const next = Math.max(prev - 1, 0);
          if (next !== prev) {
            setDirection(-1);
          }
          return next;
        });
      }

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 1500);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [hasViewedAll]);

  const handleLabelClick = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    setViewedCards((viewed) => new Set(viewed).add(index));
  };

  const activeContent = carouselContent[activeIndex];

  return (
    <section className="bg-white">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Main Hero Area */}
        <div className="py-16 border-b border-brand-ui-muted">
          <div className="grid lg:grid-cols-[2fr,1fr] gap-12">
            {/* Featured Content */}
            <div className="flex flex-col justify-between min-w-0">
              <div>
                {/* Carousel Navigation Labels */}
                <div className="flex justify-start gap-3 mb-8">
                  {carouselContent.map((content, index) => (
                    <button
                      key={content.id}
                      onClick={() => handleLabelClick(index)}
                      className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all border-2 ${
                        activeIndex === index
                          ? `border-${content.color} text-${content.color} bg-brand-light-muted`
                          : 'border-brand-ui-muted text-brand-dark-muted hover:border-brand-ui-intense'
                      }`}
                    >
                      {content.label}
                    </button>
                  ))}
                </div>

                {/* Animated Carousel Card */}
                <div className="relative overflow-hidden mb-12" style={{ minHeight: '500px' }}>
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={activeContent.id}
                      custom={direction}
                      initial={{ x: direction > 0 ? 1000 : -1000, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: direction > 0 ? -1000 : 1000, opacity: 0 }}
                      transition={{
                        x: { type: 'spring', stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                      }}
                      className={`border-l-4 border-${activeContent.color} bg-brand-light-muted p-12`}
                    >
                      {/* Main Headline */}
                      <h1 className="text-6xl lg:text-7xl font-serif font-bold text-brand-dark-intense mb-6 leading-[1.1] tracking-tight">
                        {activeContent.headline}
                      </h1>

                      <p className="text-2xl text-brand-dark-muted leading-relaxed mb-10 max-w-2xl font-light">
                        {activeContent.subheadline}
                      </p>

                      {/* Stats */}
                      <div className="flex items-start gap-12 mb-8">
                        {activeContent.stats.map((stat, idx) => (
                          <div key={idx}>
                            <div
                              className={`text-7xl font-serif font-bold text-${activeContent.color} mb-2`}
                            >
                              {stat.value}
                            </div>
                            <div className="text-xs font-semibold text-brand-dark-intense uppercase tracking-wider">
                              {stat.label}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Description */}
                      <p className="text-lg text-brand-dark-muted leading-relaxed max-w-2xl mb-8">
                        {activeContent.description}
                      </p>

                      {/* Progress indicator */}
                      <div className="flex gap-2 mt-8">
                        {carouselContent.map((_, idx) => (
                          <div
                            key={idx}
                            className={`h-1 flex-1 transition-all ${
                              idx === activeIndex
                                ? `bg-${activeContent.color}`
                                : 'bg-brand-ui-muted'
                            }`}
                          />
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Featured Blog Post */}
              <div className="pt-8 border-t border-brand-ui mt-12">
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
                        Our racing analysts break down the field and identify the overlooked
                        contenders that could deliver serious returns this year.
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
