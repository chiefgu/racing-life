'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, Trophy, BarChart3, Heart, Gift } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/cn';

export default function ProfessionalHeader() {
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="w-full bg-white sticky top-0 z-50 shadow-sm">
      {/* Main Header Bar */}
      <div className="relative w-full border-b border-gray-200">
        <div className="relative flex justify-between items-center w-full max-w-7xl mx-auto px-4 h-16">
          {/* Left Navigation Group */}
          <div className="flex items-center space-x-3">
            {/* Small Logo (visible on scroll) */}
            <Link
              href="/"
              className={cn(
                'font-bold text-blue-600 text-2xl transition-all duration-300',
                isScrolled ? 'block' : 'hidden'
              )}
            >
              RL
            </Link>

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMegaMenuOpen(!megaMenuOpen)}
              className="p-1 text-gray-900 hover:text-blue-600 transition-colors"
              aria-label="Toggle menu"
            >
              {megaMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Search Button */}
            <button
              className="p-1 text-gray-900 hover:text-blue-600 transition-colors"
              aria-label="Search"
            >
              <Search className="w-6 h-6" />
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-5 ml-2">
              <Link
                href="/races"
                className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors"
              >
                Races
              </Link>
              <Link
                href="/odds-comparison"
                className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors"
              >
                Odds
              </Link>
              <Link
                href="/news"
                className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors"
              >
                News
              </Link>
              <Link
                href="/insights"
                className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors"
              >
                Insights
              </Link>
            </nav>
          </div>

          {/* Center Logo Group (visible at top) */}
          <div
            className={cn(
              'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-300',
              isScrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'
            )}
          >
            <Link href="/" className="block text-3xl font-bold text-blue-600 whitespace-nowrap">
              Racing Life
            </Link>
          </div>

          {/* Right Auth Group */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/account"
                  className="text-sm font-medium text-gray-800 hover:text-black"
                >
                  {user?.name || 'Account'}
                </Link>
                <Link
                  href="/dashboard"
                  className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-800 hover:text-black">
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mega Menu */}
      <AnimatePresence>
        {megaMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-gray-50 shadow-lg overflow-hidden"
          >
            <div className="p-8 border-t border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
                {/* Racing Hub - Main Links */}
                <div className="lg:col-span-3">
                  <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">
                    RACING HUB
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3">
                    {/* Column 1 */}
                    <ul className="space-y-3">
                      <li>
                        <Link
                          href="/races/today"
                          className="block text-gray-900 hover:text-blue-600 font-medium transition-colors"
                        >
                          Today's Races
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/results"
                          className="block text-gray-900 hover:text-blue-600 font-medium transition-colors"
                        >
                          Race Results
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/form-guides"
                          className="block text-gray-900 hover:text-blue-600 font-medium transition-colors"
                        >
                          Form Guides
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/data"
                          className="block text-gray-900 hover:text-blue-600 font-medium transition-colors"
                        >
                          Historical Data
                        </Link>
                      </li>
                    </ul>

                    {/* Column 2 */}
                    <ul className="space-y-3">
                      <li>
                        <Link
                          href="/odds-comparison"
                          className="block text-gray-900 hover:text-blue-600 font-medium transition-colors"
                        >
                          Odds Comparison
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/news"
                          className="block text-gray-900 hover:text-blue-600 font-medium transition-colors"
                        >
                          Breaking News
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/sentiment"
                          className="block text-gray-900 hover:text-blue-600 font-medium transition-colors"
                        >
                          AI Sentiment
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/insights"
                          className="block text-gray-900 hover:text-blue-600 font-medium transition-colors"
                        >
                          Expert Insights
                        </Link>
                      </li>
                    </ul>

                    {/* Column 3 */}
                    <ul className="space-y-3">
                      <li>
                        <Link
                          href="/my-stable"
                          className="block text-gray-900 hover:text-blue-600 font-medium transition-colors"
                        >
                          Track Horses
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/my-jockeys"
                          className="block text-gray-900 hover:text-blue-600 font-medium transition-colors"
                        >
                          Track Jockeys
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/guides"
                          className="block text-gray-900 hover:text-blue-600 font-medium transition-colors"
                        >
                          Betting Guides
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/ambassadors"
                          className="block text-gray-900 hover:text-blue-600 font-medium transition-colors"
                        >
                          Ambassadors
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Tools & Community Column */}
                <div className="lg:col-span-1 space-y-4">
                  <Link
                    href="/odds-comparison"
                    className="flex items-center space-x-3 hover:bg-white p-2 rounded-lg transition-colors"
                  >
                    <div className="w-16 h-16 bg-blue-100 flex items-center justify-center rounded-lg text-blue-600">
                      <BarChart3 className="w-8 h-8" />
                    </div>
                    <span className="text-gray-900 font-medium">Live Odds Comparison</span>
                  </Link>

                  <Link
                    href="/my-stable"
                    className="flex items-center space-x-3 hover:bg-white p-2 rounded-lg transition-colors"
                  >
                    <div className="w-16 h-16 bg-blue-100 flex items-center justify-center rounded-lg text-blue-600">
                      <Heart className="w-8 h-8" />
                    </div>
                    <span className="text-gray-900 font-medium">My Stable Tracker</span>
                  </Link>

                  <Link
                    href="/refer"
                    className="flex items-center space-x-3 hover:bg-white p-2 rounded-lg transition-colors"
                  >
                    <div className="w-16 h-16 bg-blue-100 flex items-center justify-center rounded-lg text-blue-600">
                      <Gift className="w-8 h-8" />
                    </div>
                    <span className="text-gray-900 font-medium">Referral System</span>
                  </Link>
                </div>

                {/* Featured Races Column */}
                <div className="lg:col-span-1">
                  <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">
                    FEATURED RACES
                  </h3>

                  {/* Featured Image */}
                  <Link href="/races/melbourne-cup" className="block mb-4 group">
                    <div className="relative overflow-hidden rounded-lg shadow-md">
                      <div className="w-full h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Trophy className="w-16 h-16 text-white" />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                      <div className="absolute bottom-2 left-2 text-white font-bold text-sm">
                        Melbourne Cup
                      </div>
                    </div>
                  </Link>

                  <ul className="space-y-3">
                    <li>
                      <Link
                        href="/races/caulfield-cup"
                        className="block text-gray-900 hover:text-blue-600 font-medium transition-colors"
                      >
                        Caulfield Cup
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/races/cox-plate"
                        className="block text-gray-900 hover:text-blue-600 font-medium transition-colors"
                      >
                        Cox Plate
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/races/group-1"
                        className="block text-gray-900 hover:text-blue-600 font-medium transition-colors"
                      >
                        All Group 1 Races
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
