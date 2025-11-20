'use client';

interface StatsTabProps {
  venue: string;
  distance: number;
}

export default function StatsTab({ venue, distance }: StatsTabProps) {
  // Mock data - TODO: Replace with real stats from API
  const trackTrends = {
    barrierStats: [
      { range: '1-2', wins: 3, percentage: 15, color: 'bg-yellow-500' },
      { range: '3-8', wins: 13, percentage: 65, color: 'bg-green-500' },
      { range: '9+', wins: 4, percentage: 20, color: 'bg-orange-500' },
    ],
    runStyleSuccess: [
      { style: 'Leaders', percentage: 20 },
      { style: 'On-pace', percentage: 30 },
      { style: 'Hold-up', percentage: 50 },
    ],
    trackBias: 'No significant bias',
    railPosition: 'True - Favors on-pace runners',
    weatherImpact: 'Recent rain: Track firmed overnight. Good 4 → Suits horses with turn of foot',
  };

  const jockeyTrainerForm = {
    topJockey: {
      name: 'J. McDonald',
      venue: venue,
      last30: { wins: 7, rides: 23, sr: 30 },
      distance: { wins: 3, rides: 12, sr: 25 },
    },
    topTrainer: {
      name: 'C. Waller',
      venue: venue,
      last30: { wins: 12, runners: 45, sr: 27 },
      group1: { wins: 18, runners: 67, sr: 27 },
    },
    combo: {
      jockey: 'J. McDonald',
      trainer: 'C. Waller',
      wins: 8,
      starts: 13,
      sr: 62,
    },
  };

  return (
    <div className="space-y-6">
      {/* Track Trends */}
      <div className="border-2 border-gray-900 bg-white">
        <div className="border-b-2 border-gray-900 p-4 bg-gray-50">
          <h2 className="text-lg font-serif font-bold text-gray-900">
            Track Trends - {venue} {distance}m
          </h2>
          <p className="text-sm text-gray-600">Last 20 races at this distance</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Barrier Stats */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3">🎯 Barrier Statistics</h3>
            <div className="space-y-2">
              {trackTrends.barrierStats.map((stat) => (
                <div key={stat.range}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700">Barriers {stat.range}</span>
                    <span className="font-bold text-gray-900">
                      {stat.wins} wins ({stat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 overflow-hidden">
                    <div
                      className={`h-full ${stat.color}`}
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Run Style Success */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3">🏃 Run Style Success Rate</h3>
            <div className="space-y-2">
              {trackTrends.runStyleSuccess.map((style) => (
                <div key={style.style}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700">{style.style}</span>
                    <span className="font-bold text-gray-900">{style.percentage}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 overflow-hidden">
                    <div
                      className="h-full bg-brand-primary"
                      style={{ width: `${style.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Track Condition & Bias */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3">🌤️ Track Condition Impact</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Track Bias:</span>
                <p className="text-gray-900">{trackTrends.trackBias}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Rail Position:</span>
                <p className="text-gray-900">{trackTrends.railPosition}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Weather Impact:</span>
                <p className="text-gray-900">{trackTrends.weatherImpact}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jockey & Trainer Form */}
      <div className="border-2 border-gray-900 bg-white">
        <div className="border-b-2 border-gray-900 p-4 bg-gray-50">
          <h2 className="text-lg font-serif font-bold text-gray-900">Jockey & Trainer Form</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Top Jockey */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3">
              {jockeyTrainerForm.topJockey.name} @ {jockeyTrainerForm.topJockey.venue}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 border border-gray-300">
                <p className="text-gray-600 mb-1">Last 30 days</p>
                <p className="font-bold text-gray-900">
                  {jockeyTrainerForm.topJockey.last30.wins}-
                  {jockeyTrainerForm.topJockey.last30.rides} (
                  {jockeyTrainerForm.topJockey.last30.sr}% SR) 🟢
                </p>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-300">
                <p className="text-gray-600 mb-1">At this distance</p>
                <p className="font-bold text-gray-900">
                  {jockeyTrainerForm.topJockey.distance.wins}-
                  {jockeyTrainerForm.topJockey.distance.rides} (
                  {jockeyTrainerForm.topJockey.distance.sr}% SR)
                </p>
              </div>
            </div>
            <button className="mt-2 text-sm font-semibold text-brand-primary hover:text-brand-primary-intense">
              View all rides today →
            </button>
          </div>

          {/* Top Trainer */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3">
              {jockeyTrainerForm.topTrainer.name} @ {jockeyTrainerForm.topTrainer.venue}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 border border-gray-300">
                <p className="text-gray-600 mb-1">Last 30 days</p>
                <p className="font-bold text-gray-900">
                  {jockeyTrainerForm.topTrainer.last30.wins}-
                  {jockeyTrainerForm.topTrainer.last30.runners} (
                  {jockeyTrainerForm.topTrainer.last30.sr}% SR) 🟢
                </p>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-300">
                <p className="text-gray-600 mb-1">In Group 1s</p>
                <p className="font-bold text-gray-900">
                  {jockeyTrainerForm.topTrainer.group1.wins}-
                  {jockeyTrainerForm.topTrainer.group1.runners} (
                  {jockeyTrainerForm.topTrainer.group1.sr}% SR)
                </p>
              </div>
            </div>
            <button className="mt-2 text-sm font-semibold text-brand-primary hover:text-brand-primary-intense">
              View all runners today →
            </button>
          </div>

          {/* Jockey/Trainer Combo */}
          <div className="p-4 bg-orange-50 border-2 border-orange-300">
            <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
              🔥 {jockeyTrainerForm.combo.jockey}/{jockeyTrainerForm.combo.trainer} Combo
            </h3>
            <p className="text-sm text-gray-900">
              Past 12 months:{' '}
              <span className="font-bold">
                {jockeyTrainerForm.combo.wins}-{jockeyTrainerForm.combo.starts} (
                {jockeyTrainerForm.combo.sr}% SR)
              </span>
            </p>
            <p className="text-sm text-gray-900 mt-1">
              At this track: <span className="font-bold">5-8 (62% SR)</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
