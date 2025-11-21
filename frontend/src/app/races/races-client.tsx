'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Grid3x3, List, Clock, MapPin, FileText } from 'lucide-react';
import EditorialHeader from '@/components/layout/EditorialHeader';
import ModernFooter from '@/components/layout/ModernFooter';
import { cn } from '@/lib/cn';

interface Race {
  id: string;
  raceNumber: number;
  time: string;
  distance: string;
  class: string;
  prizeMoney: string;
  trackCondition: string;
  status: 'completed' | 'live' | 'upcoming';
  favorite?: {
    name: string;
    number: number;
    odds: number;
  };
  winner?: {
    name: string;
    number: number;
    time: string;
  };
}

interface Venue {
  name: string;
  state: 'VIC' | 'NSW' | 'QLD' | 'SA' | 'WA';
  races: Race[];
}

// Countdown Timer Component
function CountdownTimer({ targetTime }: { targetTime: string }) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const [hours, minutes] = targetTime.split(':').map(Number);
      const target = new Date(now);
      target.setHours(hours, minutes, 0, 0);

      // If target time has passed, assume it's tomorrow
      if (target < now) {
        target.setDate(target.getDate() + 1);
      }

      const difference = target.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft('Starting soon');
        return;
      }

      const hoursLeft = Math.floor(difference / (1000 * 60 * 60));
      const minutesLeft = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const secondsLeft = Math.floor((difference % (1000 * 60)) / 1000);

      if (hoursLeft > 0) {
        setTimeLeft(`${hoursLeft}h ${minutesLeft}m`);
      } else if (minutesLeft > 0) {
        setTimeLeft(`${minutesLeft}m ${secondsLeft}s`);
      } else {
        setTimeLeft(`${secondsLeft}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  return <span>{timeLeft || 'Calculating...'}</span>;
}

export default function RacesClient() {
  const [selectedDate, setSelectedDate] = useState<'today' | 'tomorrow' | 'dayAfter'>('today');
  const [selectedState, setSelectedState] = useState<'all' | 'VIC' | 'NSW' | 'QLD' | 'SA' | 'WA'>(
    'all'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get date labels
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const dayAfterName = dayAfter.toLocaleDateString('en-AU', { weekday: 'long' });

  // Mock data - comprehensive race information
  const mockVenues: Venue[] = [
    {
      name: 'Flemington',
      state: 'VIC',
      races: [
        {
          id: 'flemington-r1',
          raceNumber: 1,
          time: '12:30',
          distance: '1200m',
          class: 'Benchmark 78',
          prizeMoney: '$50,000',
          trackCondition: 'Good 4',
          status: 'completed',
          winner: { name: 'Speedy Star', number: 3, time: '1:09.45' },
        },
        {
          id: 'flemington-r2',
          raceNumber: 2,
          time: '13:05',
          distance: '1400m',
          class: 'Maiden',
          prizeMoney: '$35,000',
          trackCondition: 'Good 4',
          status: 'completed',
          winner: { name: 'First Timer', number: 7, time: '1:23.12' },
        },
        {
          id: 'flemington-r3',
          raceNumber: 3,
          time: '13:40',
          distance: '1600m',
          class: 'Listed',
          prizeMoney: '$120,000',
          trackCondition: 'Good 4',
          status: 'completed',
          winner: { name: 'Classic Beauty', number: 2, time: '1:35.89' },
        },
        {
          id: 'flemington-r4',
          raceNumber: 4,
          time: '14:15',
          distance: '1400m',
          class: 'Group 3',
          prizeMoney: '$175,000',
          trackCondition: 'Good 4',
          status: 'live',
          favorite: { name: 'Thunder Bolt', number: 4, odds: 3.5 },
        },
        {
          id: 'flemington-r5',
          raceNumber: 5,
          time: '14:50',
          distance: '2000m',
          class: 'Benchmark 84',
          prizeMoney: '$60,000',
          trackCondition: 'Good 4',
          status: 'upcoming',
          favorite: { name: 'Long Distance', number: 1, odds: 4.2 },
        },
        {
          id: 'flemington-r6',
          raceNumber: 6,
          time: '15:25',
          distance: '1200m',
          class: 'Fillies & Mares',
          prizeMoney: '$55,000',
          trackCondition: 'Good 4',
          status: 'upcoming',
          favorite: { name: 'Lady Lightning', number: 5, odds: 2.8 },
        },
        {
          id: 'flemington-r7',
          raceNumber: 7,
          time: '16:00',
          distance: '1800m',
          class: 'Open Handicap',
          prizeMoney: '$70,000',
          trackCondition: 'Good 4',
          status: 'upcoming',
          favorite: { name: 'Steady Runner', number: 8, odds: 5.5 },
        },
        {
          id: 'flemington-r8',
          raceNumber: 8,
          time: '16:35',
          distance: '1400m',
          class: 'Benchmark 70',
          prizeMoney: '$45,000',
          trackCondition: 'Good 4',
          status: 'upcoming',
          favorite: { name: 'Final Dash', number: 6, odds: 3.9 },
        },
      ],
    },
    {
      name: 'Randwick',
      state: 'NSW',
      races: [
        {
          id: 'randwick-r1',
          raceNumber: 1,
          time: '12:45',
          distance: '1000m',
          class: 'Maiden',
          prizeMoney: '$40,000',
          trackCondition: 'Soft 5',
          status: 'completed',
          winner: { name: 'Quick Start', number: 4, time: '0:57.23' },
        },
        {
          id: 'randwick-r2',
          raceNumber: 2,
          time: '13:20',
          distance: '1200m',
          class: 'Benchmark 72',
          prizeMoney: '$50,000',
          trackCondition: 'Soft 5',
          status: 'completed',
          winner: { name: 'Rainy Day', number: 2, time: '1:10.45' },
        },
        {
          id: 'randwick-r3',
          raceNumber: 3,
          time: '13:55',
          distance: '1600m',
          class: 'Group 2',
          prizeMoney: '$250,000',
          trackCondition: 'Soft 5',
          status: 'live',
          favorite: { name: 'Lightning Strike', number: 1, odds: 2.4 },
        },
        {
          id: 'randwick-r4',
          raceNumber: 4,
          time: '14:30',
          distance: '1400m',
          class: 'Listed',
          prizeMoney: '$130,000',
          trackCondition: 'Soft 5',
          status: 'upcoming',
          favorite: { name: 'Storm Chaser', number: 3, odds: 4.1 },
        },
        {
          id: 'randwick-r5',
          raceNumber: 5,
          time: '15:05',
          distance: '2400m',
          class: 'Open Handicap',
          prizeMoney: '$75,000',
          trackCondition: 'Soft 5',
          status: 'upcoming',
          favorite: { name: 'Marathon Man', number: 7, odds: 3.2 },
        },
        {
          id: 'randwick-r6',
          raceNumber: 6,
          time: '15:40',
          distance: '1200m',
          class: 'Benchmark 78',
          prizeMoney: '$55,000',
          trackCondition: 'Soft 5',
          status: 'upcoming',
          favorite: { name: 'Speedy Girl', number: 9, odds: 2.9 },
        },
        {
          id: 'randwick-r7',
          raceNumber: 7,
          time: '16:15',
          distance: '1800m',
          class: 'Benchmark 88',
          prizeMoney: '$65,000',
          trackCondition: 'Soft 5',
          status: 'upcoming',
          favorite: { name: 'Consistent', number: 5, odds: 4.8 },
        },
        {
          id: 'randwick-r8',
          raceNumber: 8,
          time: '16:50',
          distance: '1400m',
          class: 'Fillies & Mares',
          prizeMoney: '$60,000',
          trackCondition: 'Soft 5',
          status: 'upcoming',
          favorite: { name: 'Pretty Fast', number: 2, odds: 3.3 },
        },
      ],
    },
    {
      name: 'Caulfield',
      state: 'VIC',
      races: [
        {
          id: 'caulfield-r1',
          raceNumber: 1,
          time: '13:00',
          distance: '1100m',
          class: 'Maiden',
          prizeMoney: '$35,000',
          trackCondition: 'Good 3',
          status: 'completed',
          winner: { name: 'Debutant', number: 6, time: '1:03.56' },
        },
        {
          id: 'caulfield-r2',
          raceNumber: 2,
          time: '13:35',
          distance: '1400m',
          class: 'Benchmark 70',
          prizeMoney: '$45,000',
          trackCondition: 'Good 3',
          status: 'completed',
          winner: { name: 'Local Hero', number: 1, time: '1:22.78' },
        },
        {
          id: 'caulfield-r3',
          raceNumber: 3,
          time: '14:10',
          distance: '1600m',
          class: 'Benchmark 84',
          prizeMoney: '$60,000',
          trackCondition: 'Good 3',
          status: 'completed',
          winner: { name: 'Reliable', number: 4, time: '1:34.23' },
        },
        {
          id: 'caulfield-r4',
          raceNumber: 4,
          time: '14:45',
          distance: '2000m',
          class: 'Listed',
          prizeMoney: '$140,000',
          trackCondition: 'Good 3',
          status: 'live',
          favorite: { name: 'Golden Arrow', number: 2, odds: 2.1 },
        },
        {
          id: 'caulfield-r5',
          raceNumber: 5,
          time: '15:20',
          distance: '1200m',
          class: 'Benchmark 78',
          prizeMoney: '$50,000',
          trackCondition: 'Good 3',
          status: 'upcoming',
          favorite: { name: 'Sprint Queen', number: 8, odds: 3.7 },
        },
        {
          id: 'caulfield-r6',
          raceNumber: 6,
          time: '15:55',
          distance: '1800m',
          class: 'Open Handicap',
          prizeMoney: '$70,000',
          trackCondition: 'Good 3',
          status: 'upcoming',
          favorite: { name: 'Middle Man', number: 3, odds: 4.5 },
        },
        {
          id: 'caulfield-r7',
          raceNumber: 7,
          time: '16:30',
          distance: '1400m',
          class: 'Benchmark 88',
          prizeMoney: '$65,000',
          trackCondition: 'Good 3',
          status: 'upcoming',
          favorite: { name: 'Strong Finish', number: 7, odds: 2.6 },
        },
      ],
    },
    {
      name: 'Rosehill',
      state: 'NSW',
      races: [
        {
          id: 'rosehill-r1',
          raceNumber: 1,
          time: '12:50',
          distance: '1200m',
          class: 'Maiden',
          prizeMoney: '$38,000',
          trackCondition: 'Heavy 8',
          status: 'completed',
          winner: { name: 'Mud Lover', number: 5, time: '1:11.89' },
        },
        {
          id: 'rosehill-r2',
          raceNumber: 2,
          time: '13:25',
          distance: '1500m',
          class: 'Benchmark 72',
          prizeMoney: '$48,000',
          trackCondition: 'Heavy 8',
          status: 'completed',
          winner: { name: 'Wet Track', number: 3, time: '1:30.12' },
        },
        {
          id: 'rosehill-r3',
          raceNumber: 3,
          time: '14:00',
          distance: '1400m',
          class: 'Group 3',
          prizeMoney: '$180,000',
          trackCondition: 'Heavy 8',
          status: 'live',
          favorite: { name: 'Heavy Hitter', number: 2, odds: 2.8 },
        },
        {
          id: 'rosehill-r4',
          raceNumber: 4,
          time: '14:35',
          distance: '2000m',
          class: 'Benchmark 88',
          prizeMoney: '$70,000',
          trackCondition: 'Heavy 8',
          status: 'upcoming',
          favorite: { name: 'Stamina King', number: 6, odds: 3.4 },
        },
        {
          id: 'rosehill-r5',
          raceNumber: 5,
          time: '15:10',
          distance: '1100m',
          class: 'Benchmark 78',
          prizeMoney: '$52,000',
          trackCondition: 'Heavy 8',
          status: 'upcoming',
          favorite: { name: 'Short Sharp', number: 4, odds: 4.0 },
        },
        {
          id: 'rosehill-r6',
          raceNumber: 6,
          time: '15:45',
          distance: '1800m',
          class: 'Open Handicap',
          prizeMoney: '$68,000',
          trackCondition: 'Heavy 8',
          status: 'upcoming',
          favorite: { name: 'All Rounder', number: 1, odds: 3.1 },
        },
        {
          id: 'rosehill-r7',
          raceNumber: 7,
          time: '16:20',
          distance: '1400m',
          class: 'Fillies & Mares',
          prizeMoney: '$58,000',
          trackCondition: 'Heavy 8',
          status: 'upcoming',
          favorite: { name: 'Female Force', number: 9, odds: 2.5 },
        },
        {
          id: 'rosehill-r8',
          raceNumber: 8,
          time: '16:55',
          distance: '1600m',
          class: 'Benchmark 84',
          prizeMoney: '$60,000',
          trackCondition: 'Heavy 8',
          status: 'upcoming',
          favorite: { name: 'Final Hope', number: 8, odds: 3.8 },
        },
      ],
    },
    {
      name: 'Moonee Valley',
      state: 'VIC',
      races: [
        {
          id: 'moonee-r1',
          raceNumber: 1,
          time: '13:15',
          distance: '1000m',
          class: 'Maiden',
          prizeMoney: '$35,000',
          trackCondition: 'Good 4',
          status: 'completed',
          winner: { name: 'Valley Star', number: 2, time: '0:58.34' },
        },
        {
          id: 'moonee-r2',
          raceNumber: 2,
          time: '13:50',
          distance: '1200m',
          class: 'Benchmark 70',
          prizeMoney: '$45,000',
          trackCondition: 'Good 4',
          status: 'completed',
          winner: { name: 'Night Runner', number: 7, time: '1:09.67' },
        },
        {
          id: 'moonee-r3',
          raceNumber: 3,
          time: '14:25',
          distance: '1500m',
          class: 'Listed',
          prizeMoney: '$130,000',
          trackCondition: 'Good 4',
          status: 'live',
          favorite: { name: 'Moonlight', number: 3, odds: 3.2 },
        },
        {
          id: 'moonee-r4',
          raceNumber: 4,
          time: '15:00',
          distance: '1200m',
          class: 'Benchmark 78',
          prizeMoney: '$50,000',
          trackCondition: 'Good 4',
          status: 'upcoming',
          favorite: { name: 'Quick Turn', number: 5, odds: 2.7 },
        },
        {
          id: 'moonee-r5',
          raceNumber: 5,
          time: '15:35',
          distance: '1600m',
          class: 'Open Handicap',
          prizeMoney: '$65,000',
          trackCondition: 'Good 4',
          status: 'upcoming',
          favorite: { name: 'Valley King', number: 1, odds: 4.3 },
        },
        {
          id: 'moonee-r6',
          raceNumber: 6,
          time: '16:10',
          distance: '1400m',
          class: 'Benchmark 84',
          prizeMoney: '$60,000',
          trackCondition: 'Good 4',
          status: 'upcoming',
          favorite: { name: 'Closer', number: 4, odds: 3.5 },
        },
      ],
    },
  ];

  // Filter venues by selected state
  const filteredVenues =
    selectedState === 'all'
      ? mockVenues
      : mockVenues.filter((venue) => venue.state === selectedState);

  // Get next race for countdown
  const getNextRace = (races: Race[]) => {
    return races.find((race) => race.status === 'upcoming');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <EditorialHeader />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-[1400px] mx-auto px-6 py-12">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Today's Races</h1>
                <p className="text-gray-600">
                  {new Date().toLocaleDateString('en-AU', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>

              {/* View Toggle */}
              <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded transition-colors text-sm font-semibold',
                    viewMode === 'grid'
                      ? 'bg-white text-brand-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <Grid3x3 className="w-4 h-4" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded transition-colors text-sm font-semibold',
                    viewMode === 'list'
                      ? 'bg-white text-brand-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <List className="w-4 h-4" />
                  List
                </button>
              </div>
            </div>

            {/* Date and State Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {/* Date Selector */}
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                  Select Date
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedDate('today')}
                    className={cn(
                      'flex-1 px-4 py-2 text-sm font-semibold rounded transition-colors',
                      selectedDate === 'today'
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setSelectedDate('tomorrow')}
                    className={cn(
                      'flex-1 px-4 py-2 text-sm font-semibold rounded transition-colors',
                      selectedDate === 'tomorrow'
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    Tomorrow
                  </button>
                  <button
                    onClick={() => setSelectedDate('dayAfter')}
                    className={cn(
                      'flex-1 px-4 py-2 text-sm font-semibold rounded transition-colors',
                      selectedDate === 'dayAfter'
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {dayAfterName}
                  </button>
                </div>
              </div>

              {/* State Selector */}
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                  Select State
                </label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedState('all')}
                    className={cn(
                      'px-3 py-2 text-sm font-semibold rounded transition-colors',
                      selectedState === 'all'
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedState('VIC')}
                    className={cn(
                      'px-3 py-2 text-sm font-semibold rounded transition-colors',
                      selectedState === 'VIC'
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    VIC
                  </button>
                  <button
                    onClick={() => setSelectedState('NSW')}
                    className={cn(
                      'px-3 py-2 text-sm font-semibold rounded transition-colors',
                      selectedState === 'NSW'
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    NSW
                  </button>
                  <button
                    onClick={() => setSelectedState('QLD')}
                    className={cn(
                      'px-3 py-2 text-sm font-semibold rounded transition-colors',
                      selectedState === 'QLD'
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    QLD
                  </button>
                  <button
                    onClick={() => setSelectedState('SA')}
                    className={cn(
                      'px-3 py-2 text-sm font-semibold rounded transition-colors',
                      selectedState === 'SA'
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    SA
                  </button>
                  <button
                    onClick={() => setSelectedState('WA')}
                    className={cn(
                      'px-3 py-2 text-sm font-semibold rounded transition-colors',
                      selectedState === 'WA'
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    WA
                  </button>
                </div>
              </div>
            </div>

            {/* Grid View - Table Overview */}
            {viewMode === 'grid' && (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-900">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 uppercase tracking-wide">
                          Venue
                        </th>
                        {Array.from({ length: 8 }).map((_, i) => (
                          <th
                            key={i}
                            className="text-center py-3 px-3 text-sm font-semibold text-gray-900"
                          >
                            R{i + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVenues.map((venue, venueIndex) => {
                        const nextRaceIndex = venue.races.findIndex(
                          (race) => race.status === 'live' || race.status === 'upcoming'
                        );

                        return (
                          <tr
                            key={venue.name}
                            className={cn(
                              'border-b border-gray-200 hover:bg-gray-50 transition-colors',
                              venueIndex === 0 && 'border-t border-gray-200'
                            )}
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">{venue.name}</span>
                                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded">
                                  {venue.state}
                                </span>
                              </div>
                            </td>
                            {Array.from({ length: 8 }).map((_, i) => {
                              const race = venue.races[i];
                              const isNextRace = i === nextRaceIndex;

                              return (
                                <td key={i} className="text-center py-4 px-3">
                                  {race ? (
                                    <Link
                                      href={`/races/${venue.name.toLowerCase()}/${today.toISOString().split('T')[0]}/${race.raceNumber}`}
                                      className={cn(
                                        'inline-block px-2 py-1 text-sm rounded transition-colors',
                                        race.status === 'completed' &&
                                          'text-gray-400 hover:text-gray-600',
                                        race.status === 'live' &&
                                          'bg-red-600 text-white font-semibold hover:bg-red-700',
                                        race.status === 'upcoming' &&
                                          !isNextRace &&
                                          'text-gray-700 hover:bg-gray-100',
                                        race.status === 'upcoming' &&
                                          isNextRace &&
                                          'bg-black text-white font-semibold hover:bg-gray-800'
                                      )}
                                    >
                                      {race.time}
                                    </Link>
                                  ) : (
                                    <span className="text-gray-300">—</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {filteredVenues.map((venue) => {
                    const nextRaceIndex = venue.races.findIndex(
                      (race) => race.status === 'live' || race.status === 'upcoming'
                    );

                    return (
                      <div
                        key={venue.name}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{venue.name}</h4>
                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded">
                              {venue.state}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-4 gap-2">
                            {venue.races.map((race, index) => {
                              const isNextRace = index === nextRaceIndex;

                              return (
                                <div key={race.id} className="text-center">
                                  <div className="text-xs text-gray-500 mb-1">
                                    R{race.raceNumber}
                                  </div>
                                  <Link
                                    href={`/races/${venue.name.toLowerCase()}/${today.toISOString().split('T')[0]}/${race.raceNumber}`}
                                    className={cn(
                                      'inline-block px-2 py-1 text-xs rounded w-full',
                                      race.status === 'completed' && 'text-gray-400',
                                      race.status === 'live' &&
                                        'bg-red-600 text-white font-semibold',
                                      race.status === 'upcoming' &&
                                        !isNextRace &&
                                        'text-gray-700 bg-gray-50',
                                      race.status === 'upcoming' &&
                                        isNextRace &&
                                        'bg-black text-white font-semibold'
                                    )}
                                  >
                                    {race.time}
                                  </Link>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-8">
                {filteredVenues.map((venue) => {
                  const nextRace = getNextRace(venue.races);

                  return (
                    <div key={venue.name} className="space-y-3">
                      {/* Venue Header */}
                      <div className="flex items-center justify-between border-b-2 border-gray-900 pb-3">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-brand-primary" />
                          <h2 className="text-2xl font-serif font-bold text-gray-900">
                            {venue.name}
                          </h2>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                            {venue.state}
                          </span>
                        </div>
                        {nextRace && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-brand-primary" />
                            <span className="font-semibold text-gray-900">
                              Next: <CountdownTimer targetTime={nextRace.time} />
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Race List */}
                      <div className="space-y-2">
                        {venue.races.map((race) => (
                          <Link
                            key={race.id}
                            href={`/races/${venue.name.toLowerCase()}/${today.toISOString().split('T')[0]}/${race.raceNumber}`}
                            className="block group"
                          >
                            <div
                              className={cn(
                                'border rounded-lg p-3 sm:p-4 transition-all hover:shadow-md',
                                race.status === 'live' && 'border-red-600 border-2 bg-red-50',
                                race.status === 'completed' && 'border-gray-200 bg-gray-50',
                                race.status === 'upcoming' &&
                                  'border-gray-200 hover:border-brand-primary bg-white'
                              )}
                            >
                              {/* Mobile Layout */}
                              <div className="flex flex-col gap-3 md:hidden">
                                {/* Top Row - Race Number & Time */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={cn(
                                        'w-10 h-10 rounded flex items-center justify-center font-bold text-base',
                                        race.status === 'live' && 'bg-red-600 text-white',
                                        race.status === 'completed' && 'bg-gray-400 text-white',
                                        race.status === 'upcoming' && 'bg-brand-primary text-white'
                                      )}
                                    >
                                      R{race.raceNumber}
                                    </div>
                                    <div>
                                      <div className="font-bold text-gray-900">{race.time}</div>
                                      <div
                                        className={cn(
                                          'text-xs font-semibold uppercase',
                                          race.status === 'live' && 'text-red-600',
                                          race.status === 'completed' && 'text-gray-500',
                                          race.status === 'upcoming' && 'text-brand-primary'
                                        )}
                                      >
                                        {race.status === 'live' && 'LIVE'}
                                        {race.status === 'completed' && 'FINISHED'}
                                        {race.status === 'upcoming' && 'UPCOMING'}
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      // Handle form guide click
                                    }}
                                    className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-brand-primary hover:text-white text-gray-700 rounded text-xs font-semibold transition-colors"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    Form
                                  </button>
                                </div>

                                {/* Middle - Race Details Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <div className="text-xs text-gray-500">Distance</div>
                                    <div className="font-semibold text-gray-900 text-sm">
                                      {race.distance}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500">Track</div>
                                    <div className="font-semibold text-gray-900 text-sm">
                                      {race.trackCondition}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500">Class</div>
                                    <div className="font-semibold text-gray-900 text-sm">
                                      {race.class}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500">Prize</div>
                                    <div className="font-semibold text-brand-primary text-sm">
                                      {race.prizeMoney}
                                    </div>
                                  </div>
                                </div>

                                {/* Bottom - Winner/Favorite */}
                                {race.status === 'completed' && race.winner && (
                                  <div className="pt-3 border-t border-gray-200">
                                    <div className="text-xs text-gray-500 mb-1">Winner</div>
                                    <div className="font-bold text-gray-900">
                                      {race.winner.number}. {race.winner.name}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-0.5">
                                      {race.winner.time}
                                    </div>
                                  </div>
                                )}

                                {race.status !== 'completed' && race.favorite && (
                                  <div className="pt-3 border-t border-gray-200">
                                    <div className="text-xs text-gray-500 mb-1">Favorite</div>
                                    <div className="flex items-baseline justify-between">
                                      <div className="font-bold text-gray-900">
                                        {race.favorite.number}. {race.favorite.name}
                                      </div>
                                      <div className="text-base font-bold text-brand-accent-intense">
                                        ${race.favorite.odds.toFixed(2)}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Desktop Layout */}
                              <div className="hidden md:flex items-center justify-between gap-4">
                                {/* Race Number & Status */}
                                <div className="flex items-center gap-3 min-w-[140px]">
                                  <div
                                    className={cn(
                                      'w-12 h-12 rounded flex items-center justify-center font-bold text-lg',
                                      race.status === 'live' && 'bg-red-600 text-white',
                                      race.status === 'completed' && 'bg-gray-400 text-white',
                                      race.status === 'upcoming' && 'bg-brand-primary text-white'
                                    )}
                                  >
                                    R{race.raceNumber}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">{race.time}</div>
                                    <div
                                      className={cn(
                                        'text-xs font-semibold uppercase',
                                        race.status === 'live' && 'text-red-600',
                                        race.status === 'completed' && 'text-gray-500',
                                        race.status === 'upcoming' && 'text-brand-primary'
                                      )}
                                    >
                                      {race.status === 'live' && 'LIVE'}
                                      {race.status === 'completed' && 'FINISHED'}
                                      {race.status === 'upcoming' && 'UPCOMING'}
                                    </div>
                                  </div>
                                </div>

                                {/* Race Details */}
                                <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
                                  <div>
                                    <div className="text-xs text-gray-500">Distance</div>
                                    <div className="font-semibold text-gray-900">
                                      {race.distance}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500">Class</div>
                                    <div className="font-semibold text-gray-900 text-sm">
                                      {race.class}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500">Track</div>
                                    <div className="font-semibold text-gray-900">
                                      {race.trackCondition}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500">Prize</div>
                                    <div className="font-semibold text-brand-primary">
                                      {race.prizeMoney}
                                    </div>
                                  </div>
                                </div>

                                {/* Favorite/Winner & Actions */}
                                <div className="flex items-center gap-3 min-w-[220px] justify-end">
                                  {race.status === 'completed' && race.winner && (
                                    <div className="text-right">
                                      <div className="text-xs text-gray-500 mb-1">Winner</div>
                                      <div className="font-bold text-gray-900">
                                        {race.winner.number}. {race.winner.name}
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        {race.winner.time}
                                      </div>
                                    </div>
                                  )}

                                  {race.status !== 'completed' && race.favorite && (
                                    <div className="text-right">
                                      <div className="text-xs text-gray-500 mb-1">Favorite</div>
                                      <div className="font-bold text-gray-900">
                                        {race.favorite.number}. {race.favorite.name}
                                      </div>
                                      <div className="text-sm font-bold text-brand-accent-intense">
                                        ${race.favorite.odds.toFixed(2)}
                                      </div>
                                    </div>
                                  )}

                                  {/* Form Guide Link */}
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      // Handle form guide click
                                    }}
                                    className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-brand-primary hover:text-white text-gray-700 rounded text-sm font-semibold transition-colors"
                                  >
                                    <FileText className="w-4 h-4" />
                                    Form
                                  </button>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Status Legend */}
            <div className="flex flex-wrap items-center gap-6 mt-12 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                <span className="text-sm text-gray-600">Live Now</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-brand-primary rounded"></div>
                <span className="text-sm text-gray-600">Upcoming</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
                <span className="text-sm text-gray-600">Finished</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <ModernFooter />
    </div>
  );
}
