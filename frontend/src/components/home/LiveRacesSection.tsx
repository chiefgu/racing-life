'use client';

import { useState } from 'react';
import { useRaces } from '@/hooks/api/useRaces';
import { cn } from '@/lib/cn';

interface Race {
  id: string;
  time: string;
  raceNumber: number;
  status: 'completed' | 'live' | 'upcoming';
}

interface Venue {
  name: string;
  races: Race[];
}

export default function LiveRacesSection() {
  const { isLoading } = useRaces();
  const [selectedDate, setSelectedDate] = useState<'today' | 'tomorrow' | 'dayAfter'>('today');
  const [selectedState, setSelectedState] = useState<'all' | 'VIC' | 'NSW' | 'QLD' | 'SA' | 'WA'>(
    'all'
  );

  // Get date labels
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const dayAfterName = dayAfter.toLocaleDateString('en-AU', { weekday: 'long' });

  // Mock data - organized by venue
  const mockVenues: Venue[] = [
    {
      name: 'Flemington',
      races: [
        { id: '1', time: '12:30', raceNumber: 1, status: 'completed' },
        { id: '2', time: '13:05', raceNumber: 2, status: 'completed' },
        { id: '3', time: '13:40', raceNumber: 3, status: 'completed' },
        { id: '4', time: '14:15', raceNumber: 4, status: 'live' },
        { id: '5', time: '14:50', raceNumber: 5, status: 'upcoming' },
        { id: '6', time: '15:25', raceNumber: 6, status: 'upcoming' },
        { id: '7', time: '16:00', raceNumber: 7, status: 'upcoming' },
        { id: '8', time: '16:35', raceNumber: 8, status: 'upcoming' },
      ],
    },
    {
      name: 'Randwick',
      races: [
        { id: '9', time: '12:45', raceNumber: 1, status: 'completed' },
        { id: '10', time: '13:20', raceNumber: 2, status: 'completed' },
        { id: '11', time: '13:55', raceNumber: 3, status: 'live' },
        { id: '12', time: '14:30', raceNumber: 4, status: 'upcoming' },
        { id: '13', time: '15:05', raceNumber: 5, status: 'upcoming' },
        { id: '14', time: '15:40', raceNumber: 6, status: 'upcoming' },
        { id: '15', time: '16:15', raceNumber: 7, status: 'upcoming' },
        { id: '16', time: '16:50', raceNumber: 8, status: 'upcoming' },
      ],
    },
    {
      name: 'Caulfield',
      races: [
        { id: '17', time: '13:00', raceNumber: 1, status: 'completed' },
        { id: '18', time: '13:35', raceNumber: 2, status: 'completed' },
        { id: '19', time: '14:10', raceNumber: 3, status: 'completed' },
        { id: '20', time: '14:45', raceNumber: 4, status: 'live' },
        { id: '21', time: '15:20', raceNumber: 5, status: 'upcoming' },
        { id: '22', time: '15:55', raceNumber: 6, status: 'upcoming' },
        { id: '23', time: '16:30', raceNumber: 7, status: 'upcoming' },
      ],
    },
    {
      name: 'Rosehill',
      races: [
        { id: '24', time: '12:50', raceNumber: 1, status: 'completed' },
        { id: '25', time: '13:25', raceNumber: 2, status: 'completed' },
        { id: '26', time: '14:00', raceNumber: 3, status: 'live' },
        { id: '27', time: '14:35', raceNumber: 4, status: 'upcoming' },
        { id: '28', time: '15:10', raceNumber: 5, status: 'upcoming' },
        { id: '29', time: '15:45', raceNumber: 6, status: 'upcoming' },
        { id: '30', time: '16:20', raceNumber: 7, status: 'upcoming' },
        { id: '31', time: '16:55', raceNumber: 8, status: 'upcoming' },
      ],
    },
    {
      name: 'Moonee Valley',
      races: [
        { id: '32', time: '13:15', raceNumber: 1, status: 'completed' },
        { id: '33', time: '13:50', raceNumber: 2, status: 'completed' },
        { id: '34', time: '14:25', raceNumber: 3, status: 'live' },
        { id: '35', time: '15:00', raceNumber: 4, status: 'upcoming' },
        { id: '36', time: '15:35', raceNumber: 5, status: 'upcoming' },
        { id: '37', time: '16:10', raceNumber: 6, status: 'upcoming' },
      ],
    },
  ];

  const venues = mockVenues;

  const getNextRaceIndex = (races: Race[]) => {
    return races.findIndex((race) => race.status === 'live' || race.status === 'upcoming');
  };

  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-12 pb-6 border-b border-gray-200">
          <div>
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-2">Racing Schedule</h2>
            <p className="text-gray-600">
              {new Date().toLocaleDateString('en-AU', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <span className="text-sm font-semibold text-gray-900 border-b border-gray-900 cursor-default">
            View all details →
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Race Schedule - 2/3 width */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200"></div>
                ))}
              </div>
            ) : (
              <>
                {/* Date and State Selector */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 pb-6 border-b border-gray-200">
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
                      {venues.map((venue, venueIndex) => {
                        const nextRaceIndex = getNextRaceIndex(venue.races);

                        return (
                          <tr
                            key={venue.name}
                            className={cn(
                              'border-b border-gray-200 hover:bg-gray-50 transition-colors',
                              venueIndex === 0 && 'border-t border-gray-200'
                            )}
                          >
                            <td className="py-4 px-4">
                              <span className="font-semibold text-gray-900 cursor-default">
                                {venue.name}
                              </span>
                            </td>
                            {Array.from({ length: 8 }).map((_, i) => {
                              const race = venue.races[i];
                              const isNextRace = i === nextRaceIndex;

                              return (
                                <td key={i} className="text-center py-4 px-3">
                                  {race ? (
                                    <span
                                      className={cn(
                                        'inline-block px-2 py-1 text-sm cursor-default',
                                        race.status === 'completed' && 'text-gray-400',
                                        race.status === 'live' &&
                                          'bg-red-600 text-white font-semibold',
                                        race.status === 'upcoming' &&
                                          !isNextRace &&
                                          'text-gray-700',
                                        race.status === 'upcoming' &&
                                          isNextRace &&
                                          'bg-black text-white font-semibold'
                                      )}
                                    >
                                      {race.time}
                                    </span>
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
                  {venues.map((venue) => {
                    const nextRaceIndex = getNextRaceIndex(venue.races);

                    return (
                      <div
                        key={venue.name}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <h4 className="font-semibold text-gray-900">{venue.name}</h4>
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
                                  <span
                                    className={cn(
                                      'inline-block px-2 py-1 text-xs rounded cursor-default w-full',
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
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-5 sm:w-12 sm:h-6 bg-red-600 rounded"></div>
                    <span className="text-xs text-gray-600">Live Now</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-5 sm:w-12 sm:h-6 bg-black rounded"></div>
                    <span className="text-xs text-gray-600">Next Race</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-5 sm:w-12 sm:h-6 border border-gray-300 bg-gray-50 rounded"></div>
                    <span className="text-xs text-gray-600">Upcoming</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">—</span>
                    <span className="text-xs text-gray-600">Completed</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bookmaker Promotions - 1/3 width */}
          <div className="space-y-3">
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-3">Promotions</h3>

            {/* Promotion Slot 1 */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg p-4 text-white border-2 border-dashed border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-white px-2.5 py-0.5 rounded">
                  <span className="text-gray-800 font-bold text-sm">Your Brand</span>
                </div>
                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">Featured</span>
              </div>
              <h4 className="text-base font-bold mb-1.5">Premium Ad Space</h4>
              <p className="text-xs text-gray-300 mb-3">
                Showcase your promotions to engaged racing fans.
              </p>
              <button className="w-full bg-white text-gray-800 font-semibold py-1.5 px-3 rounded text-sm hover:bg-gray-100 transition-colors">
                Advertise Here
              </button>
            </div>

            {/* Promotion Slot 2 */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg p-4 text-white border-2 border-dashed border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-white px-2.5 py-0.5 rounded">
                  <span className="text-gray-800 font-bold text-sm">Your Brand</span>
                </div>
                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">Premium</span>
              </div>
              <h4 className="text-base font-bold mb-1.5">Promotion Spotlight</h4>
              <p className="text-xs text-gray-300 mb-3">
                Prime visibility for your latest offers and bonuses.
              </p>
              <button className="w-full bg-white text-gray-800 font-semibold py-1.5 px-3 rounded text-sm hover:bg-gray-100 transition-colors">
                Get Started
              </button>
            </div>

            {/* Promotion Slot 3 */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg p-4 text-white border-2 border-dashed border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-white px-2.5 py-0.5 rounded">
                  <span className="text-gray-800 font-bold text-sm">Your Brand</span>
                </div>
                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">Featured</span>
              </div>
              <h4 className="text-base font-bold mb-1.5">Brand Showcase</h4>
              <p className="text-xs text-gray-300 mb-3">
                Connect with active bettors at decision time.
              </p>
              <button className="w-full bg-white text-gray-800 font-semibold py-1.5 px-3 rounded text-sm hover:bg-gray-100 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
