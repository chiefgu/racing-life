'use client';

interface TrackConditionsProps {
  venue: string;
  distance: number;
  raceId: string;
}

export default function TrackConditions({ venue, distance, raceId }: TrackConditionsProps) {
  // Mock data - TODO: Replace with real API data
  const currentConditions = {
    trackRating: 'Good 4',
    penetrometer: 4.8,
    railPosition: 'True',
    weather: {
      current: 'Sunny',
      temperature: 22,
      wind: { speed: 10, direction: 'NW' },
      humidity: 45,
    },
    lastUpdated: new Date(),
  };

  const trackInfo = {
    circumference: 2000,
    homestraight: 450,
    trackType: 'Turf',
    direction: 'Clockwise',
  };

  const barrierStats = [
    { barrier: '1', runner: 'Winx', wins: 2, places: 3, starts: 20, winPct: 10, placePct: 25 },
    {
      barrier: '2',
      runner: 'Verry Elleegant',
      wins: 3,
      places: 4,
      starts: 20,
      winPct: 15,
      placePct: 35,
    },
    {
      barrier: '3',
      runner: 'Black Caviar',
      wins: 4,
      places: 3,
      starts: 20,
      winPct: 20,
      placePct: 35,
    },
    {
      barrier: '4',
      runner: 'Might And Power',
      wins: 3,
      places: 5,
      starts: 20,
      winPct: 15,
      placePct: 40,
    },
    {
      barrier: '5',
      runner: 'Makybe Diva',
      wins: 2,
      places: 2,
      starts: 20,
      winPct: 10,
      placePct: 20,
    },
    { barrier: '6', runner: 'Sunline', wins: 3, places: 1, starts: 20, winPct: 15, placePct: 20 },
    {
      barrier: '7',
      runner: 'Kingston Town',
      wins: 2,
      places: 1,
      starts: 20,
      winPct: 10,
      placePct: 15,
    },
    {
      barrier: '8',
      runner: 'Better Loosen Up',
      wins: 1,
      places: 1,
      starts: 20,
      winPct: 5,
      placePct: 10,
    },
  ];

  const runningStyles = [
    { position: 'Leader', wins: 4, percentage: 20, color: '#ef4444' },
    { position: 'Prominent', wins: 6, percentage: 30, color: '#f97316' },
    { position: 'Midfield', wins: 8, percentage: 40, color: '#3b82f6' },
    { position: 'Back', wins: 2, percentage: 10, color: '#6b7280' },
  ];

  const sectionalTimes = [
    { section: '1st 400m', average: '24.8s', fastest: '23.9s', runner: 'Verry Elleegant' },
    { section: '2nd 400m', average: '25.2s', fastest: '24.1s', runner: 'Incentivise' },
    { section: '3rd 400m', average: '24.9s', fastest: '23.7s', runner: 'Anamoe' },
    { section: 'Last 400m', average: '23.1s', fastest: '22.3s', runner: 'Spanish Mission' },
  ];

  const formatLastUpdated = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const maxWinPct = Math.max(...barrierStats.map((b) => b.winPct));

  return (
    <div className="border border-brand-ui bg-white">
      {/* Current Conditions Header */}
      <div className="border-b border-brand-ui p-4 bg-brand-light">
        <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">Track & Conditions</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
          <div>
            <div className="text-gray-600 mb-0.5">Track Rating</div>
            <div className="font-bold text-gray-900">{currentConditions.trackRating}</div>
          </div>
          <div>
            <div className="text-gray-600 mb-0.5">Penetrometer</div>
            <div className="font-bold text-gray-900">{currentConditions.penetrometer}</div>
          </div>
          <div>
            <div className="text-gray-600 mb-0.5">Rail</div>
            <div className="font-bold text-gray-900">{currentConditions.railPosition}</div>
          </div>
          <div>
            <div className="text-gray-600 mb-0.5">Weather</div>
            <div className="font-bold text-gray-900">{currentConditions.weather.current}</div>
          </div>
          <div>
            <div className="text-gray-600 mb-0.5">Temperature</div>
            <div className="font-bold text-gray-900">{currentConditions.weather.temperature}°C</div>
          </div>
          <div>
            <div className="text-gray-600 mb-0.5">Wind</div>
            <div className="font-bold text-gray-900">
              {currentConditions.weather.wind.speed}km/h {currentConditions.weather.wind.direction}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-5">
        {/* Track Information */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-2">
            {venue} - {distance}m Track Details
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-gray-600">Circumference:</span>
              <span className="ml-1 font-semibold text-gray-900">{trackInfo.circumference}m</span>
            </div>
            <div>
              <span className="text-gray-600">Home Straight:</span>
              <span className="ml-1 font-semibold text-gray-900">{trackInfo.homestraight}m</span>
            </div>
            <div>
              <span className="text-gray-600">Surface:</span>
              <span className="ml-1 font-semibold text-gray-900">{trackInfo.trackType}</span>
            </div>
            <div>
              <span className="text-gray-600">Direction:</span>
              <span className="ml-1 font-semibold text-gray-900">{trackInfo.direction}</span>
            </div>
          </div>
        </div>

        {/* Barrier Statistics */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-2">
            Barrier Draw Statistics - {distance}m (Last 20 Races)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-brand-ui bg-brand-light">
                  <th className="text-left py-2 px-3 font-semibold text-gray-900">Barrier</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">
                    Today's Runner
                  </th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700">Wins</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700">Places</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700">Starts</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Win %</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Place %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-ui">
                {barrierStats.map((stat) => (
                  <tr key={stat.barrier} className="hover:bg-brand-light transition-colors">
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-brand-primary text-white text-xs font-bold">
                        {stat.barrier}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-600 italic">{stat.runner}</td>
                    <td className="text-center py-2 px-2 font-semibold text-gray-900">
                      {stat.wins}
                    </td>
                    <td className="text-center py-2 px-2 text-gray-700">{stat.places}</td>
                    <td className="text-center py-2 px-2 text-gray-600">{stat.starts}</td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200">
                          <div
                            className={`h-full ${stat.winPct === maxWinPct ? 'bg-green-600' : 'bg-blue-500'}`}
                            style={{ width: `${(stat.winPct / maxWinPct) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold text-gray-900 w-8">
                          {stat.winPct}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200">
                          <div
                            className="h-full bg-gray-400"
                            style={{ width: `${stat.placePct}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-700 w-8">{stat.placePct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Running Styles */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-2">
            Running Position Analysis - {distance}m (Last 20 Races)
          </h3>
          <div className="space-y-2">
            {runningStyles.map((style) => (
              <div key={style.position}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-700">{style.position}</span>
                  <span className="text-xs font-bold text-gray-900">
                    {style.wins} wins ({style.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-200">
                  <div
                    className="h-full"
                    style={{ width: `${style.percentage}%`, backgroundColor: style.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sectional Times */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-2">Sectional Times - {distance}m</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-brand-ui bg-brand-light">
                  <th className="text-left py-2 px-3 font-semibold text-gray-900">Section</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700">Average</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700">Fastest</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Horse</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-ui">
                {sectionalTimes.map((section, idx) => (
                  <tr key={idx} className="hover:bg-brand-light transition-colors">
                    <td className="py-2 px-3 font-semibold text-gray-900">{section.section}</td>
                    <td className="text-center py-2 px-2 text-gray-700">{section.average}</td>
                    <td className="text-center py-2 px-2 font-semibold text-green-600">
                      {section.fastest}
                    </td>
                    <td className="py-2 px-3 text-gray-700">{section.runner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Track Notes */}
        <div className="border-t border-brand-ui pt-4">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Track Notes</h3>
          <div className="text-xs space-y-1.5 text-gray-700">
            <div className="flex gap-2">
              <span className="font-semibold text-gray-900 min-w-[100px]">Bias:</span>
              <span>No significant advantage to leaders or backmarkers</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-gray-900 min-w-[100px]">Rail Impact:</span>
              <span>Inside barriers (1-4) slight advantage - True position suits on-pace</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-gray-900 min-w-[100px]">Forecast:</span>
              <span>Fine conditions, track expected to remain {currentConditions.trackRating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-brand-ui p-3 bg-brand-light text-xs text-gray-600">
        <p>
          Updated:{' '}
          <span className="font-semibold">{formatLastUpdated(currentConditions.lastUpdated)}</span>{' '}
          • Statistics from last 20 races at {distance}m
        </p>
      </div>
    </div>
  );
}
