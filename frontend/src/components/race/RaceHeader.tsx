'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface RaceHeaderProps {
  race: {
    venue: string;
    raceNumber: number;
    raceName: string;
    time: string;
    distance: number;
    class: string;
    prizeMoney: number;
    trackCondition: string;
    rail: string;
    weather: {
      temp: number;
      condition: string;
      wind: string;
    };
  };
}

export default function RaceHeader({ race }: RaceHeaderProps) {
  const [isTrackDropdownOpen, setIsTrackDropdownOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2025-11-18'); // TODO: Use actual date from URL

  const formatPrizeMoney = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper to format date for display
  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date('2025-11-18'); // TODO: Use actual today
    const diffDays = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';

    const weekday = date.toLocaleDateString('en-AU', { weekday: 'short' });
    const day = date.getDate();
    const month = date.toLocaleDateString('en-AU', { month: 'short' });
    return `${weekday} ${day} ${month}`;
  };

  // Helper to get previous/next date
  const getAdjacentDate = (dateStr: string, offset: number) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
  };

  // Mock data - TODO: Replace with real API data
  const totalRacesAtVenue = 8;
  const currentVenueSlug = race.venue.toLowerCase().replace(/\s+/g, '-');
  const todayDate = '2025-11-18'; // TODO: Use actual date

  // TODO: Implement date navigation
  // const previousDate = getAdjacentDate(todayDate, -1);
  // const nextDate = getAdjacentDate(todayDate, 1);

  // Mock data - tracks available per date (TODO: Replace with real API data)
  const getTracksForDate = (_date: string) => {
    // This would normally fetch from API based on date
    return {
      NSW: [
        { name: 'Randwick', races: 10, slug: 'randwick' },
        { name: 'Rosehill', races: 9, slug: 'rosehill' },
        { name: 'Canterbury', races: 8, slug: 'canterbury' },
        { name: 'Warwick Farm', races: 8, slug: 'warwick-farm' },
      ],
      QLD: [
        { name: 'Eagle Farm', races: 9, slug: 'eagle-farm' },
        { name: 'Doomben', races: 8, slug: 'doomben' },
        { name: 'Gold Coast', races: 8, slug: 'gold-coast' },
      ],
    };
  };

  const tracksForSelectedDate = getTracksForDate(selectedDate);

  const selectedPreviousDate = getAdjacentDate(selectedDate, -1);
  const selectedNextDate = getAdjacentDate(selectedDate, 1);

  return (
    <div className="border-b border-brand-ui bg-white">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Race Navigation */}
        <div className="border-b border-brand-ui py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Schedule Button */}
            <Link
              href="/races"
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-900 hover:text-brand-primary transition-colors border border-brand-ui hover:border-brand-primary"
            >
              <ChevronLeft className="w-4 h-4" />
              Today's Schedule
            </Link>

            {/* Combined Track & Date Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsTrackDropdownOpen(!isTrackDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-900 hover:text-brand-primary transition-colors border border-brand-ui hover:border-brand-primary"
              >
                {race.venue} • {formatDateDisplay(todayDate)}
                <ChevronDown className="w-4 h-4" />
              </button>

              {isTrackDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsTrackDropdownOpen(false)}
                  />
                  {/* Dropdown */}
                  <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-brand-ui shadow-lg z-40">
                    {/* Date Navigation Section */}
                    <div className="border-b border-brand-ui p-3 bg-brand-light">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => setSelectedDate(selectedPreviousDate)}
                          className="p-1.5 text-gray-700 hover:text-brand-primary hover:bg-white transition-colors border border-brand-ui hover:border-brand-primary"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="flex-1 text-center px-3 py-1.5 text-sm font-semibold text-gray-900 border border-brand-ui bg-white">
                          {formatDateDisplay(selectedDate)}
                        </span>
                        <button
                          onClick={() => setSelectedDate(selectedNextDate)}
                          className="p-1.5 text-gray-700 hover:text-brand-primary hover:bg-white transition-colors border border-brand-ui hover:border-brand-primary"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Tracks Section */}
                    {Object.entries(tracksForSelectedDate).map(([state, tracks]) => (
                      <div key={state} className="border-b border-brand-ui last:border-0">
                        <div className="px-4 py-2 bg-brand-light text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          {state}
                        </div>
                        <div className="py-1">
                          {tracks.map((track) => (
                            <Link
                              key={track.slug}
                              href={`/races/${track.slug}/${selectedDate}/1`}
                              className="block px-4 py-2 text-sm text-gray-900 hover:bg-brand-light hover:text-brand-primary transition-colors"
                              onClick={() => setIsTrackDropdownOpen(false)}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{track.name}</span>
                                <span className="text-xs text-gray-500">{track.races} races</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Race Number Navigation */}
            <div className="flex-1 overflow-x-auto">
              <div className="flex items-center gap-1">
                {Array.from({ length: totalRacesAtVenue }, (_, i) => i + 1).map((raceNum) => {
                  const isActive = raceNum === race.raceNumber;
                  return (
                    <Link
                      key={raceNum}
                      href={`/races/${currentVenueSlug}/${todayDate}/${raceNum}`}
                      className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-brand-primary text-white'
                          : 'text-gray-700 hover:bg-brand-light hover:text-brand-primary border border-brand-ui'
                      }`}
                    >
                      R{raceNum}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Race Header Content */}
        <div className="py-6">
          {/* Main Race Title */}
          <div className="mb-4">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-sm font-semibold text-brand-primary uppercase tracking-wide">
                {race.venue}
              </span>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-600">{race.time}</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-1">
              Race {race.raceNumber}: {race.raceName}
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="font-semibold text-brand-secondary">{race.class}</span>
              <span className="text-gray-400">•</span>
              <span>{race.distance}m</span>
              <span className="text-gray-400">•</span>
              <span className="font-medium text-brand-accent-intense">
                {formatPrizeMoney(race.prizeMoney)}
              </span>
            </div>
          </div>

          {/* Race Conditions - Clean Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-4 border-t border-brand-ui">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Track
              </div>
              <div className="text-sm font-semibold text-gray-900">{race.trackCondition}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Rail
              </div>
              <div className="text-sm font-semibold text-gray-900">{race.rail}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Weather
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {race.weather.condition}, {race.weather.temp}°C
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Wind
              </div>
              <div className="text-sm font-semibold text-gray-900">{race.weather.wind}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
