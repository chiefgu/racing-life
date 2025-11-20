'use client';

interface SpeedMapProps {
  raceId: string;
}

export default function SpeedMap({ raceId: _raceId }: SpeedMapProps) {
  // Mock data - TODO: Replace with real sectional data
  const horses = [
    {
      number: 3,
      name: 'Early Bird',
      runStyle: 'Leader',
      barrier: 5,
      positions: { start: 1, '400m': 1, '800m': 2, '1200m': 3, finish: 4 },
      sectionals: ['23.8s', '24.1s', '24.3s', '23.5s'],
    },
    {
      number: 7,
      name: 'Pacesetter',
      runStyle: 'Leader',
      barrier: 2,
      positions: { start: 2, '400m': 2, '800m': 1, '1200m': 2, finish: 3 },
      sectionals: ['23.9s', '23.8s', '24.0s', '23.8s'],
    },
    {
      number: 12,
      name: 'Sprint King',
      runStyle: 'On-pace',
      barrier: 8,
      positions: { start: 3, '400m': 3, '800m': 3, '1200m': 1, finish: 1 },
      sectionals: ['24.2s', '23.9s', '23.5s', '22.8s'],
    },
    {
      number: 1,
      name: 'Verry Elleegant',
      runStyle: 'Hold-up',
      barrier: 1,
      positions: { start: 8, '400m': 7, '800m': 5, '1200m': 3, finish: 2 },
      sectionals: ['25.1s', '24.5s', '23.8s', '23.2s'],
    },
    {
      number: 5,
      name: 'Incentivise',
      runStyle: 'Midfield',
      barrier: 4,
      positions: { start: 6, '400m': 6, '800m': 6, '1200m': 5, finish: 5 },
      sectionals: ['24.8s', '24.6s', '24.3s', '23.9s'],
    },
    {
      number: 9,
      name: 'Back Marker',
      runStyle: 'Back',
      barrier: 7,
      positions: { start: 10, '400m': 10, '800m': 9, '1200m': 8, finish: 7 },
      sectionals: ['25.5s', '25.1s', '24.8s', '24.2s'],
    },
    {
      number: 4,
      name: 'Winx',
      runStyle: 'On-pace',
      barrier: 3,
      positions: { start: 4, '400m': 4, '800m': 4, '1200m': 4, finish: 6 },
      sectionals: ['24.3s', '24.2s', '24.1s', '24.0s'],
    },
    {
      number: 8,
      name: 'Black Caviar',
      runStyle: 'Midfield',
      barrier: 6,
      positions: { start: 5, '400m': 5, '800m': 7, '1200m': 6, finish: 8 },
      sectionals: ['24.5s', '24.7s', '24.5s', '24.3s'],
    },
  ];

  const getRunStyleColor = (runStyle: string) => {
    switch (runStyle) {
      case 'Leader':
        return '#ef4444';
      case 'On-pace':
        return '#f97316';
      case 'Hold-up':
      case 'Midfield':
        return '#3b82f6';
      case 'Back':
        return '#6b7280';
      default:
        return '#9ca3af';
    }
  };

  return (
    <div className="border border-brand-ui bg-white">
      {/* Header */}
      <div className="border-b border-brand-ui p-4 bg-brand-light">
        <h2 className="font-serif text-xl font-bold text-gray-900">Speed Map</h2>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Track Visualization */}
        <div className="relative bg-green-100 border-2 border-gray-400" style={{ height: '400px' }}>
          {/* Oval track */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 800 400"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Outer rail */}
            <ellipse
              cx="400"
              cy="200"
              rx="380"
              ry="180"
              fill="none"
              stroke="#8B4513"
              strokeWidth="3"
            />

            {/* Inner rail */}
            <ellipse
              cx="400"
              cy="200"
              rx="320"
              ry="140"
              fill="none"
              stroke="#8B4513"
              strokeWidth="3"
            />

            {/* Finish line */}
            <line
              x1="400"
              y1="20"
              x2="400"
              y2="60"
              stroke="#000"
              strokeWidth="4"
              strokeDasharray="5,5"
            />
            <text x="410" y="50" fontSize="12" fontWeight="bold" fill="#000">
              FINISH
            </text>

            {/* Distance markers */}
            <text x="700" y="210" fontSize="11" fill="#666">
              400m
            </text>
            <text x="400" y="370" fontSize="11" fill="#666" textAnchor="middle">
              800m
            </text>
            <text x="100" y="210" fontSize="11" fill="#666">
              1200m
            </text>

            {/* Horse positions - showing at finish */}
            {horses
              .sort((a, b) => a.positions.finish - b.positions.finish)
              .map((horse, idx) => {
                // Position horses vertically based on finish position
                const yPos = 200 + (idx - horses.length / 2) * 12;
                return (
                  <g key={horse.number}>
                    <circle
                      cx="400"
                      cy={yPos}
                      r="10"
                      fill={getRunStyleColor(horse.runStyle)}
                      stroke="#fff"
                      strokeWidth="2"
                    />
                    <text
                      x="400"
                      y={yPos + 4}
                      fontSize="10"
                      fontWeight="bold"
                      fill="#fff"
                      textAnchor="middle"
                    >
                      {horse.number}
                    </text>
                    <text x="420" y={yPos + 4} fontSize="11" fill="#000">
                      {horse.name}
                    </text>
                  </g>
                );
              })}
          </svg>
        </div>

        {/* Position guide */}
        <div className="mt-6 grid grid-cols-5 gap-4">
          {['Start', '400m', '800m', '1200m', 'Finish'].map((stage) => {
            const stageKey =
              stage === 'Start'
                ? 'start'
                : stage.toLowerCase() === 'finish'
                  ? 'finish'
                  : stage.toLowerCase();
            return (
              <div key={stage}>
                <h4 className="text-xs font-bold text-gray-900 mb-2">{stage.toUpperCase()}</h4>
                <div className="space-y-0.5">
                  {[...horses]
                    .sort(
                      (a, b) =>
                        a.positions[stageKey as keyof typeof a.positions] -
                        b.positions[stageKey as keyof typeof b.positions]
                    )
                    .slice(0, 3)
                    .map((horse, idx) => (
                      <div key={horse.number} className="flex items-center gap-1 text-[10px]">
                        <span className="text-gray-500">{idx + 1}.</span>
                        <span
                          className="inline-flex items-center justify-center w-4 h-4 text-white text-[8px] font-bold"
                          style={{ backgroundColor: getRunStyleColor(horse.runStyle) }}
                        >
                          {horse.number}
                        </span>
                        <span className="text-gray-700 truncate">{horse.name}</span>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-brand-ui flex gap-4 text-xs flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4" style={{ backgroundColor: '#ef4444' }}></div>
            <span className="text-gray-700">Leader</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4" style={{ backgroundColor: '#f97316' }}></div>
            <span className="text-gray-700">On-pace</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4" style={{ backgroundColor: '#3b82f6' }}></div>
            <span className="text-gray-700">Midfield/Hold-up</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4" style={{ backgroundColor: '#6b7280' }}></div>
            <span className="text-gray-700">Back</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-brand-ui p-3 bg-brand-light text-xs text-gray-600">
        <p>Track showing predicted finish positions • Color-coded by running style</p>
      </div>
    </div>
  );
}
