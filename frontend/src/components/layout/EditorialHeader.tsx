'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/cn';

export default function EditorialHeader() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Update shadow state
      setIsScrolled(currentScrollY > 10);

      // Show top bar when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY) {
        // Scrolling up
        setShowTopBar(true);
      } else if (currentScrollY > 10 && currentScrollY > lastScrollY) {
        // Scrolling down and past threshold
        setShowTopBar(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDropdownToggle = (menu: string) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-white border-b transition-shadow duration-200",
        isScrolled ? "shadow-sm border-gray-200" : "border-gray-100"
      )}
    >
      {/* Top Bar */}
      <div className={cn(
        "border-b border-gray-100 transition-all duration-300 overflow-hidden",
        showTopBar ? "max-h-12 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-12 text-xs">
            {/* Left: Today's Date */}
            <div className="text-gray-500 font-medium">
              {new Date().toLocaleDateString('en-AU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>

            {/* Right: Auth Links */}
            <div className="flex items-center gap-5">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-700 font-medium cursor-default">
                    {user?.name || 'Account'}
                  </span>
                  <span className="text-gray-700 font-medium cursor-default">
                    Dashboard
                  </span>
                </>
              ) : (
                <>
                  <span className="text-gray-700 font-medium cursor-default">
                    Sign In
                  </span>
                  <span className="bg-black text-white px-4 py-1.5 text-xs font-semibold cursor-default">
                    Subscribe
                  </span>
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
          <span className="text-2xl font-serif font-bold text-black tracking-tight cursor-default">
            Racing Life
          </span>

          {/* Right: Navigation + Search */}
          <div className="flex items-center gap-8">
            <nav className="hidden lg:flex items-center gap-8">
              <span className="text-sm font-medium text-gray-900 border-b-2 border-transparent pb-1 cursor-default">
                Races
              </span>

              <span className="text-sm font-medium text-gray-900 border-b-2 border-transparent pb-1 cursor-default">
                Odds
              </span>

              <span className="text-sm font-medium text-gray-900 border-b-2 border-transparent pb-1 cursor-default">
                News
              </span>

              <span className="text-sm font-medium text-gray-900 border-b-2 border-transparent pb-1 cursor-default">
                Insights
              </span>

              {/* More Dropdown */}
              <div className="relative">
                <button
                  onClick={() => handleDropdownToggle('more')}
                  className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-black transition-colors"
                >
                  More
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform",
                    activeDropdown === 'more' && "rotate-180"
                  )} />
                </button>

                {activeDropdown === 'more' && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 shadow-lg">
                    <div className="py-2">
                      <span className="block px-4 py-2.5 text-sm text-gray-900 cursor-default">
                        Form Guides
                      </span>
                      <span className="block px-4 py-2.5 text-sm text-gray-900 cursor-default">
                        Results
                      </span>
                      <span className="block px-4 py-2.5 text-sm text-gray-900 cursor-default">
                        Historical Data
                      </span>
                      <div className="border-t border-gray-100 my-2"></div>
                      <span className="block px-4 py-2.5 text-sm text-gray-900 cursor-default">
                        My Stable
                      </span>
                      <span className="block px-4 py-2.5 text-sm text-gray-900 cursor-default">
                        My Jockeys
                      </span>
                      <span className="block px-4 py-2.5 text-sm text-gray-900 cursor-default">
                        Betting Guides
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Search Icon */}
            <button
              className="p-2 text-gray-700 hover:text-black transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Navigation Bar */}
      <div className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-10">
            <nav className="flex items-center gap-6 overflow-x-auto">
              <span className="text-xs font-semibold text-gray-600 whitespace-nowrap uppercase tracking-wide cursor-default">
                Today's Races
              </span>
              <span className="text-xs font-semibold text-gray-600 whitespace-nowrap uppercase tracking-wide cursor-default">
                AI Sentiment
              </span>
              <span className="text-xs font-semibold text-gray-600 whitespace-nowrap uppercase tracking-wide cursor-default">
                Melbourne Cup
              </span>
              <span className="text-xs font-semibold text-gray-600 whitespace-nowrap uppercase tracking-wide cursor-default">
                Group 1 Races
              </span>
              <span className="text-xs font-semibold text-gray-600 whitespace-nowrap uppercase tracking-wide cursor-default">
                Ambassadors
              </span>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Menu Toggle (visible on mobile only) */}
      <div className="lg:hidden border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 py-3">
          <button
            onClick={() => handleDropdownToggle('mobile')}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-900"
          >
            <span>Menu</span>
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform",
              activeDropdown === 'mobile' && "rotate-180"
            )} />
          </button>

          {activeDropdown === 'mobile' && (
            <nav className="mt-3 space-y-1 border-t border-gray-100 pt-3">
              <span className="block py-2 text-sm text-gray-900 cursor-default">
                Races
              </span>
              <span className="block py-2 text-sm text-gray-900 cursor-default">
                Odds
              </span>
              <span className="block py-2 text-sm text-gray-900 cursor-default">
                News
              </span>
              <span className="block py-2 text-sm text-gray-900 cursor-default">
                Insights
              </span>
              <span className="block py-2 text-sm text-gray-900 cursor-default">
                Form Guides
              </span>
              <span className="block py-2 text-sm text-gray-900 cursor-default">
                Results
              </span>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
