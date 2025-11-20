'use client';

import { Trophy, TrendingUp, Users } from 'lucide-react';

interface TipsTabProps {
  raceId: string;
}

export default function TipsTab({ raceId: _raceId }: TipsTabProps) {
  // Mock data - TODO: Replace with real API data
  const topTipsters = [
    {
      rank: 1,
      name: '@RacingPro',
      roi: 91,
      record: '45-50',
      pick: { number: 1, name: 'Verry Elleegant' },
      reasoning: 'Strong closing speed suits distance',
    },
    {
      rank: 2,
      name: '@FormExpert',
      roi: 87,
      record: '38-50',
      pick: { number: 5, name: 'Incentivise' },
      reasoning: 'Loves Flemington, barrier perfect',
    },
    {
      rank: 3,
      name: '@DataDriven',
      roi: 82,
      record: '41-50',
      pick: { number: 1, name: 'Verry Elleegant' },
      reasoning: "Sectionals don't lie",
    },

    {
      rank: 4,
      name: '@TrackWatcher',
      roi: 78,
      record: '39-50',
      pick: { number: 7, name: 'Spanish Mission' },
      reasoning: 'Track bias favors this run style',
    },
    {
      rank: 5,
      name: '@OddsShark',
      roi: 75,
      record: '37-50',
      pick: { number: 1, name: 'Verry Elleegant' },
      reasoning: 'Value at current odds',
    },
  ];

  const communityConsensus = {
    crowdFavorite: { number: 1, percentage: 47 },
    tipsterFavorite: { number: 1, tipstersCount: 8, totalTipsters: 10 },
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tipster Leaderboard */}
      <div className="border-2 border-gray-900 bg-white">
        <div className="border-b-2 border-gray-900 p-4 bg-gray-50">
          <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Tipster Leaderboard
          </h2>
          <p className="text-sm text-gray-600">Top performers - Last 30 days</p>
        </div>

        <div className="divide-y-2 divide-gray-200">
          {topTipsters.map((tipster) => (
            <div key={tipster.rank} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                {/* Rank Badge */}
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-100 border-2 border-gray-300 font-bold text-lg">
                  {getRankEmoji(tipster.rank)}
                </div>

                {/* Tipster Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-bold text-gray-900">{tipster.name}</h3>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-gray-600">ROI</p>
                        <p className="text-lg font-bold text-green-600">{tipster.roi}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Record</p>
                        <p className="text-sm font-semibold text-gray-900">{tipster.record}</p>
                      </div>
                    </div>
                  </div>

                  {/* Pick */}
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Tipping: #{tipster.pick.number} {tipster.pick.name}
                    </p>
                    <p className="text-sm text-gray-700">"{tipster.reasoning}"</p>
                  </div>

                  {/* Follow Button */}
                  <button className="mt-2 text-sm font-semibold text-brand-primary hover:text-brand-primary-intense">
                    Follow tipster →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTAs */}
        <div className="border-t-2 border-gray-900 p-4 bg-gray-50 flex gap-2">
          <button className="flex-1 px-4 py-2 border-2 border-gray-900 text-sm font-semibold hover:bg-gray-100 transition-colors">
            View Full Leaderboard
          </button>
          <button className="flex-1 px-4 py-2 bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors">
            Become a Tipster
          </button>
        </div>
      </div>

      {/* Community Consensus */}
      <div className="border-2 border-gray-900 bg-white">
        <div className="border-b-2 border-gray-900 p-4 bg-gray-50">
          <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-primary" />
            Community Consensus
          </h2>
          <p className="text-sm text-gray-600">
            Based on 8,429 votes + {communityConsensus.tipsterFavorite.totalTipsters} top tipster
            selections
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 border-2 border-gray-300">
              <p className="text-sm text-gray-600 mb-1">Crowd Favorite</p>
              <p className="text-2xl font-bold text-gray-900">
                #{communityConsensus.crowdFavorite.number}
              </p>
              <p className="text-sm text-gray-600">
                {communityConsensus.crowdFavorite.percentage}% of votes
              </p>
            </div>
            <div className="p-4 bg-gray-50 border-2 border-gray-300">
              <p className="text-sm text-gray-600 mb-1">Tipster Favorite</p>
              <p className="text-2xl font-bold text-gray-900">
                #{communityConsensus.tipsterFavorite.number}
              </p>
              <p className="text-sm text-gray-600">
                {communityConsensus.tipsterFavorite.tipstersCount}/
                {communityConsensus.tipsterFavorite.totalTipsters} tipsters
              </p>
            </div>
          </div>

          {/* Insight */}
          <div className="p-4 bg-green-50 border-2 border-green-200">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-900 mb-1">Strong Agreement</p>
                <p className="text-sm text-green-800">
                  Both the crowd and expert tipsters agree on #
                  {communityConsensus.crowdFavorite.number}. This alignment often indicates a
                  genuine contender.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button className="flex-1 px-4 py-3 border-2 border-gray-900 text-sm font-semibold hover:bg-gray-50 transition-colors">
              Share Your Tip
            </button>
            <button className="flex-1 px-4 py-3 bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary-intense transition-colors">
              Follow Top Tipsters
            </button>
          </div>
        </div>
      </div>

      {/* Become a Tipster CTA */}
      <div className="border-2 border-brand-primary bg-brand-primary-intense p-6 text-white">
        <h3 className="text-xl font-serif font-bold mb-2">Start Your Tipping Journey</h3>
        <p className="text-sm text-gray-200 mb-4">
          Share your racing insights, build a following, and compete on the leaderboard. Track your
          performance and earn badges for your expertise.
        </p>
        <ul className="space-y-2 text-sm mb-4">
          <li className="flex items-center gap-2">
            <span className="text-brand-accent">✓</span> Track your tipping record automatically
          </li>
          <li className="flex items-center gap-2">
            <span className="text-brand-accent">✓</span> Earn badges and achievements
          </li>
          <li className="flex items-center gap-2">
            <span className="text-brand-accent">✓</span> Build a following of racing fans
          </li>
          <li className="flex items-center gap-2">
            <span className="text-brand-accent">✓</span> Compete on the public leaderboard
          </li>
        </ul>
        <button className="w-full px-6 py-3 bg-white text-brand-primary-intense text-base font-bold hover:bg-gray-100 transition-colors">
          Sign Up Free & Start Tipping
        </button>
      </div>
    </div>
  );
}
