'use client';

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
    return races.findIndex(race => race.status === 'live' || race.status === 'upcoming');
  };

  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-12 pb-6 border-b border-gray-200">
          <div>
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-2">
              Today's Race Schedule
            </h2>
            <p className="text-gray-600">
              {new Date().toLocaleDateString('en-AU', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
          <span className="text-sm font-semibold text-gray-900 border-b border-gray-900 cursor-default">
            View all details →
          </span>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200"></div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-900">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Venue
                  </th>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <th key={i} className="text-center py-3 px-3 text-sm font-semibold text-gray-900">
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
                        "border-b border-gray-200 hover:bg-gray-50 transition-colors",
                        venueIndex === 0 && "border-t border-gray-200"
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
                                  "inline-block px-2 py-1 text-sm cursor-default",
                                  race.status === 'completed' && "text-gray-400",
                                  race.status === 'live' && "bg-red-600 text-white font-semibold",
                                  race.status === 'upcoming' && !isNextRace && "text-gray-700",
                                  race.status === 'upcoming' && isNextRace && "bg-black text-white font-semibold"
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

            {/* Legend */}
            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-12 h-6 bg-red-600"></div>
                <span className="text-xs text-gray-600">Live Now</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-6 bg-black"></div>
                <span className="text-xs text-gray-600">Next Race</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-6 border border-gray-300"></div>
                <span className="text-xs text-gray-600">Upcoming</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">—</span>
                <span className="text-xs text-gray-600">Completed</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
