import Link from 'next/link';
import { Race } from '@/types';
import { formatTime, getTimeUntilRace } from '@/lib/utils';

interface RaceCardProps {
  race: Race;
}

export default function RaceCard({ race }: RaceCardProps) {
  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-800',
    live: 'bg-green-100 text-green-800',
    resulted: 'bg-gray-100 text-gray-800',
  };

  return (
    <Link href={`/races/${race.id}`} className="block touch-manipulation">
      <div className="bg-white rounded-lg shadow hover:shadow-md active:shadow-lg transition-shadow p-4 border border-gray-200 active:border-racing-blue">
        <div className="flex justify-between items-start mb-2 gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">{race.meetingLocation}</h3>
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
              Race {race.raceNumber} - {race.raceName}
            </p>
          </div>
          <span
            className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${statusColors[race.status]}`}
          >
            {race.status === 'upcoming' && getTimeUntilRace(race.startTime)}
            {race.status === 'live' && 'LIVE'}
            {race.status === 'resulted' && 'Resulted'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 gap-2">
          <span className="truncate">{formatTime(race.startTime)}</span>
          <span className="flex-shrink-0">{race.distance}m</span>
          <span className="capitalize flex-shrink-0">{race.trackCondition}</span>
        </div>
      </div>
    </Link>
  );
}
