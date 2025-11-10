'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Search, BarChart3, Heart, Gift, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SafariCompatibleHeader() {
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
    <>
      <header className="w-full bg-white fixed top-0 z-50 shadow-sm">
        {/* Main Header Bar */}
        <div className="w-full border-b border-gray-200">
          <div className="flex justify-between items-center w-full max-w-7xl mx-auto px-4 h-16">

            {/* Left Navigation Group */}
            <div className="flex items-center gap-3">
              {/* Small Logo (visible on scroll) */}
              <Link
                href="/"
                className="font-bold text-blue-600 text-2xl"
                style={{
                  display: isScrolled ? 'block' : 'none'
                }}
              >
                RL
              </Link>

              {/* Hamburger Menu Button */}
              <button
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                className="p-1 text-gray-900 hover:text-blue-600"
                aria-label="Toggle menu"
              >
                {megaMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

              {/* Search Button */}
              <button className="p-1 text-gray-900 hover:text-blue-600" aria-label="Search">
                <Search className="w-6 h-6" />
              </button>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-5 ml-2">
                <Link href="/races" className="text-sm font-semibold text-gray-800 hover:text-blue-600">
                  Races
                </Link>
                <Link href="/odds-comparison" className="text-sm font-semibold text-gray-800 hover:text-blue-600">
                  Odds
                </Link>
                <Link href="/news" className="text-sm font-semibold text-gray-800 hover:text-blue-600">
                  News
                </Link>
                <Link href="/insights" className="text-sm font-semibold text-gray-800 hover:text-blue-600">
                  Insights
                </Link>
              </nav>
            </div>

            {/* Center Logo (visible at top) */}
            <div
              className="absolute left-1/2 top-1/2"
              style={{
                transform: 'translate(-50%, -50%)',
                opacity: isScrolled ? 0 : 1,
                pointerEvents: isScrolled ? 'none' : 'auto',
                transition: 'opacity 0.3s'
              }}
            >
              <Link href="/" className="text-3xl font-bold text-blue-600 whitespace-nowrap">
                Racing Life
              </Link>
            </div>

            {/* Right Auth Group */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link href="/account" className="text-sm font-medium text-gray-800 hover:text-black">
                    {user?.name || 'Account'}
                  </Link>
                  <Link
                    href="/dashboard"
                    className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-blue-700"
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
                    className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mega Menu */}
        {megaMenuOpen && (
          <div className="w-full bg-gray-50 shadow-lg border-t border-gray-200">
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">

                {/* Racing Hub - Main Links */}
                <div className="lg:col-span-3">
                  <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">
                    RACING HUB
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
                    {/* Column 1 */}
                    <ul className="space-y-3">
                      <li>
                        <Link
                          href="/races/today"
                          className="block text-gray-900 hover:text-blue-600 font-medium"
                          onClick={() => setMegaMenuOpen(false)}
                        >
                          Today's Races
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/results"
                          className="block text-gray-900 hover:text-blue-600 font-medium"
                          onClick={() => setMegaMenuOpen(false)}
                        >
                          Race Results
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/form-guides"
                          className="block text-gray-900 hover:text-blue-600 font-medium"
                          onClick={() => setMegaMenuOpen(false)}
                        >
                          Form Guides
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/data"
                          className="block text-gray-900 hover:text-blue-600 font-medium"
                          onClick={() => setMegaMenuOpen(false)}
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
                          className="block text-gray-900 hover:text-blue-600 font-medium"
                          onClick={() => setMegaMenuOpen(false)}
                        >
                          Odds Comparison
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/news"
                          className="block text-gray-900 hover:text-blue-600 font-medium"
                          onClick={() => setMegaMenuOpen(false)}
                        >
                          Breaking News
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/sentiment"
                          className="block text-gray-900 hover:text-blue-600 font-medium"
                          onClick={() => setMegaMenuOpen(false)}
                        >
                          AI Sentiment
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/insights"
                          className="block text-gray-900 hover:text-blue-600 font-medium"
                          onClick={() => setMegaMenuOpen(false)}
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
                          className="block text-gray-900 hover:text-blue-600 font-medium"
                          onClick={() => setMegaMenuOpen(false)}
                        >
                          Track Horses
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/my-jockeys"
                          className="block text-gray-900 hover:text-blue-600 font-medium"
                          onClick={() => setMegaMenuOpen(false)}
                        >
                          Track Jockeys
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/guides"
                          className="block text-gray-900 hover:text-blue-600 font-medium"
                          onClick={() => setMegaMenuOpen(false)}
                        >
                          Betting Guides
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/ambassadors"
                          className="block text-gray-900 hover:text-blue-600 font-medium"
                          onClick={() => setMegaMenuOpen(false)}
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
                    className="flex items-center gap-3 hover:bg-white p-2 rounded-lg"
                    onClick={() => setMegaMenuOpen(false)}
                  >
                    <div className="w-16 h-16 bg-blue-100 flex items-center justify-center rounded-lg">
                      <BarChart3 className="w-8 h-8 text-blue-600" />
                    </div>
                    <span className="text-gray-900 font-medium">
                      Live Odds Comparison
                    </span>
                  </Link>

                  <Link
                    href="/my-stable"
                    className="flex items-center gap-3 hover:bg-white p-2 rounded-lg"
                    onClick={() => setMegaMenuOpen(false)}
                  >
                    <div className="w-16 h-16 bg-blue-100 flex items-center justify-center rounded-lg">
                      <Heart className="w-8 h-8 text-blue-600" />
                    </div>
                    <span className="text-gray-900 font-medium">
                      My Stable Tracker
                    </span>
                  </Link>

                  <Link
                    href="/refer"
                    className="flex items-center gap-3 hover:bg-white p-2 rounded-lg"
                    onClick={() => setMegaMenuOpen(false)}
                  >
                    <div className="w-16 h-16 bg-blue-100 flex items-center justify-center rounded-lg">
                      <Gift className="w-8 h-8 text-blue-600" />
                    </div>
                    <span className="text-gray-900 font-medium">
                      Referral System
                    </span>
                  </Link>
                </div>

                {/* Featured Races Column */}
                <div className="lg:col-span-1">
                  <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">
                    FEATURED RACES
                  </h3>

                  <Link
                    href="/races/melbourne-cup"
                    className="block mb-4 group"
                    onClick={() => setMegaMenuOpen(false)}
                  >
                    <div className="relative overflow-hidden rounded-lg shadow-md">
                      <div className="w-full h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Trophy className="w-16 h-16 text-white" />
                      </div>
                      <div className="absolute bottom-2 left-2 text-white font-bold text-sm">
                        Melbourne Cup
                      </div>
                    </div>
                  </Link>

                  <ul className="space-y-3">
                    <li>
                      <Link
                        href="/races/caulfield-cup"
                        className="block text-gray-900 hover:text-blue-600 font-medium"
                        onClick={() => setMegaMenuOpen(false)}
                      >
                        Caulfield Cup
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/races/cox-plate"
                        className="block text-gray-900 hover:text-blue-600 font-medium"
                        onClick={() => setMegaMenuOpen(false)}
                      >
                        Cox Plate
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/races/group-1"
                        className="block text-gray-900 hover:text-blue-600 font-medium"
                        onClick={() => setMegaMenuOpen(false)}
                      >
                        All Group 1 Races
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-16"></div>
    </>
  );
}