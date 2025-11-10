import { Race, Horse } from '@/types';
import { formatDateTime } from '@/lib/utils';

interface RaceInfoProps {
  race: Race;
  horses?: Horse[];
}

export default function RaceInfo({ race, horses }: RaceInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {race.meetingLocation} - Race {race.raceNumber}
        </h1>
        <h2 className="text-xl text-gray-700">{race.raceName}</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-600 mb-1">Start Time</p>
          <p className="font-semibold">{formatDateTime(race.startTime)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Distance</p>
          <p className="font-semibold">{race.distance}m</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Track Condition</p>
          <p className="font-semibold capitalize">{race.trackCondition}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Status</p>
          <p className="font-semibold capitalize">{race.status}</p>
        </div>
      </div>

      {horses && horses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Runners</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {horses.map((horse) => (
              <div key={horse.id} className="border border-gray-200 rounded p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">
                      {horse.number}. {horse.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {horse.age}yo {horse.sex}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{horse.weight}kg</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Jockey: {horse.jockey}</p>
                  <p>Trainer: {horse.trainer}</p>
                  <p>Form: {horse.form}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
