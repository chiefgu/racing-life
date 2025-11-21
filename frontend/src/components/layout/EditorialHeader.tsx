'use client';

import { useState, useEffect } from 'react';
import { Search, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/cn';
import Link from 'next/link';
import SearchModal from './SearchModal';

export default function EditorialHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSecondaryNavOpen, setIsSecondaryNavOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    const scrollThreshold = 5; // Minimum scroll distance to trigger change
    const minScrollPos = 10; // Minimum scroll position to hide elements

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDelta = Math.abs(currentScrollY - lastScrollY);

          // Update shadow state
          setIsScrolled(currentScrollY > 10);

          // Only react to scroll changes that are significant enough
          if (scrollDelta > scrollThreshold) {
            if (currentScrollY < lastScrollY) {
              // Scrolling up - always show
              setShowTopBar(true);
            } else if (currentScrollY > minScrollPos && currentScrollY > lastScrollY) {
              // Scrolling down and past threshold - hide
              setShowTopBar(false);
            }

            lastScrollY = currentScrollY;
          }

          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 bg-white border-b transition-shadow duration-200',
        isScrolled ? 'shadow-sm border-gray-200' : 'border-gray-100'
      )}
    >
      {/* Top Bar */}
      <div
        className={cn(
          'border-b border-gray-100 transition-all duration-300 overflow-hidden will-change-[max-height,opacity]',
          showTopBar ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-12 text-xs">
            {/* Left: Today's Date */}
            <div className="text-gray-500 font-medium truncate flex-shrink min-w-0">
              {new Date().toLocaleDateString('en-AU', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </div>

            {/* Right: Auth Links */}
            <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0 ml-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-1.5 text-gray-700 hover:text-brand-primary font-medium transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{user?.name || 'Account'}</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-gray-700 hover:text-brand-primary font-medium transition-colors hidden sm:inline"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/onboarding"
                    className="text-gray-700 hover:text-brand-primary font-medium transition-colors whitespace-nowrap inline-flex items-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/onboarding"
                    className="bg-black hover:bg-gray-800 text-white px-3 sm:px-4 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap inline-flex items-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <Link
            href="/"
            className="flex items-center text-2xl font-serif font-bold text-black tracking-tight hover:text-brand-primary transition-colors leading-none"
          >
            Racing Life
          </Link>

          {/* Right: Navigation + Search */}
          <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
            <nav className="flex items-center gap-3 sm:gap-6 lg:gap-8">
              <span className="text-xs sm:text-sm font-medium text-gray-900 hover:text-brand-primary transition-colors cursor-pointer">
                My Stable
              </span>

              <span className="text-xs sm:text-sm font-medium text-gray-900 hover:text-brand-primary transition-colors cursor-pointer">
                My Jockeys
              </span>
            </nav>

            {/* Search Icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center justify-center p-2 text-gray-700 hover:text-black transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Navigation Bar */}
      <div className="border-t border-brand-primary-intense bg-brand-primary">
        <div className="max-w-[1400px] mx-auto px-6">
          {/* Desktop Navigation - hidden on mobile */}
          <div className="hidden lg:flex items-center justify-between h-10">
            <nav className="flex items-center gap-6 overflow-x-auto">
              <Link
                href="/races"
                className="text-xs font-semibold text-white/90 hover:text-white whitespace-nowrap uppercase tracking-wide cursor-pointer transition-colors"
              >
                Today's Races
              </Link>
              <Link
                href="/news"
                className="text-xs font-semibold text-white/90 hover:text-white whitespace-nowrap uppercase tracking-wide cursor-pointer transition-colors"
              >
                News & Analysis
              </Link>
              <span className="text-xs font-semibold text-white/90 hover:text-white whitespace-nowrap uppercase tracking-wide cursor-pointer transition-colors">
                AI Racing Analyst
              </span>
              <span className="text-xs font-semibold text-white/90 hover:text-white whitespace-nowrap uppercase tracking-wide cursor-pointer transition-colors">
                Bookmaker Reviews
              </span>
              <span className="text-xs font-semibold text-white/90 hover:text-white whitespace-nowrap uppercase tracking-wide cursor-pointer transition-colors">
                Race Results
              </span>
            </nav>
          </div>

          {/* Mobile Dropdown Navigation */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsSecondaryNavOpen(!isSecondaryNavOpen)}
              className="flex items-center justify-between w-full h-10 text-xs font-semibold text-white uppercase tracking-wide"
            >
              <span>Quick Links</span>
              <ChevronDown
                className={cn('w-4 h-4 transition-transform', isSecondaryNavOpen && 'rotate-180')}
              />
            </button>

            {isSecondaryNavOpen && (
              <nav className="pb-3 space-y-2 border-t border-white/20 pt-3">
                <Link
                  href="/races"
                  className="block py-1.5 text-xs font-semibold text-white/90 hover:text-white uppercase tracking-wide cursor-pointer transition-colors"
                >
                  Today's Races
                </Link>
                <Link
                  href="/news"
                  className="block py-1.5 text-xs font-semibold text-white/90 hover:text-white uppercase tracking-wide cursor-pointer transition-colors"
                >
                  News & Analysis
                </Link>
                <span className="block py-1.5 text-xs font-semibold text-white/90 hover:text-white uppercase tracking-wide cursor-pointer transition-colors">
                  AI Racing Analyst
                </span>
                <span className="block py-1.5 text-xs font-semibold text-white/90 hover:text-white uppercase tracking-wide cursor-pointer transition-colors">
                  Bookmaker Reviews
                </span>
                <span className="block py-1.5 text-xs font-semibold text-white/90 hover:text-white uppercase tracking-wide cursor-pointer transition-colors">
                  Race Results
                </span>
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* Next Races Bar */}
      <div
        className={cn(
          'border-t border-gray-200 bg-gray-50 transition-all duration-300 overflow-hidden will-change-[max-height,opacity]',
          showTopBar ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="h-10 flex items-center gap-6 overflow-x-auto scrollbar-thin">
            {/* Label - sticky on scroll */}
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wide whitespace-nowrap flex-shrink-0">
              Next To Jump:
            </span>

            <div className="flex items-center gap-6">
              {/* Race 1 */}
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-xs font-semibold text-gray-900">Flemington R4</span>
                <span className="text-xs text-gray-500">·</span>
                <span className="text-xs text-brand-secondary font-semibold">12m</span>
              </div>

              {/* Race 2 */}
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-xs font-semibold text-gray-900">Randwick R6</span>
                <span className="text-xs text-gray-500">·</span>
                <span className="text-xs text-gray-600 font-semibold">42m</span>
              </div>

              {/* Race 3 - hidden on mobile */}
              <div className="hidden lg:flex items-center gap-2 whitespace-nowrap">
                <span className="text-xs font-semibold text-gray-900">Caulfield R8</span>
                <span className="text-xs text-gray-500">·</span>
                <span className="text-xs text-gray-600 font-semibold">1h 17m</span>
              </div>

              {/* Race 4 - hidden on mobile */}
              <div className="hidden lg:flex items-center gap-2 whitespace-nowrap">
                <span className="text-xs font-semibold text-gray-900">Rosehill R3</span>
                <span className="text-xs text-gray-500">·</span>
                <span className="text-xs text-gray-600 font-semibold">1h 45m</span>
              </div>

              {/* Race 5 - hidden on mobile */}
              <div className="hidden lg:flex items-center gap-2 whitespace-nowrap">
                <span className="text-xs font-semibold text-gray-900">Moonee Valley R5</span>
                <span className="text-xs text-gray-500">·</span>
                <span className="text-xs text-gray-600 font-semibold">2h 10m</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
