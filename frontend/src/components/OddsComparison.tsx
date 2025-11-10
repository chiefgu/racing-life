'use client';

import { formatOdds } from '@/lib/utils';

interface OddsComparisonProps {
  horseName: string;
  horseNumber: number;
  currentOdds: { [bookmaker: string]: number };
  openingOdds: { [bookmaker: string]: number };
}

export default function OddsComparison({
  horseName,
  horseNumber,
  currentOdds,
  openingOdds,
}: OddsComparisonProps) {
  const bookmakers = Object.keys(currentOdds);

  const calculateChange = (opening: number, current: number): number => {
    return ((current - opening) / opening) * 100;
  };

  const getVelocityIndicator = (change: number): { color: string; arrow: string; label: string } => {
    if (Math.abs(change) < 5) {
      return { color: 'text-gray-600', arrow: '→', label: 'Stable' };
    } else if (change > 0) {
      return { color: 'text-green-600', arrow: '↑', label: 'Drifting' };
    } else {
      return { color: 'text-red-600', arrow: '↓', label: 'Firming' };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">
        Opening vs Current Odds - {horseNumber}. {horseName}
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bookmaker
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Opening
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Change
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Velocity
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookmakers.map((bookmaker) => {
              const opening = openingOdds[bookmaker] || currentOdds[bookmaker];
              const current = currentOdds[bookmaker];
              const change = calculateChange(opening, current);
              const velocity = getVelocityIndicator(change);

              return (
                <tr key={bookmaker} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {bookmaker}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                    {formatOdds(opening)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-900">
                    {formatOdds(current)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {change >= 0 ? '+' : ''}
                      {change.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    <span className={velocity.color}>
                      {velocity.arrow} {velocity.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
