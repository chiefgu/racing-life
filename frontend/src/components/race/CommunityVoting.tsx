'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CommunityVotingProps {
  raceId: string;
}

export default function CommunityVoting({ raceId: _raceId }: CommunityVotingProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState<number | null>(null);

  // Mock data - TODO: Replace with real API data
  const votes = [
    {
      horseNumber: 1,
      horseName: 'Verry Elleegant',
      votes: 3961,
      percentage: 47,
      trending: 'down',
      odds: '7/2',
    },
    {
      horseNumber: 5,
      horseName: 'Incentivise',
      votes: 1939,
      percentage: 23,
      trending: 'up',
      odds: '4/1',
    },
    {
      horseNumber: 7,
      horseName: 'Spanish Mission',
      votes: 1180,
      percentage: 14,
      trending: 'neutral',
      odds: '5/1',
    },
    {
      horseNumber: 12,
      horseName: 'Gold Trip',
      votes: 758,
      percentage: 9,
      trending: 'up',
      odds: '12/1',
    },
    {
      horseNumber: 3,
      horseName: 'Anamoe',
      votes: 591,
      percentage: 7,
      trending: 'down',
      odds: '8/1',
    },
  ];

  const totalVotes = votes.reduce((sum, v) => sum + v.votes, 0);

  const handleVote = (horseNumber: number) => {
    setSelectedHorse(horseNumber);
    setHasVoted(true);
    // TODO: Submit vote to API
  };

  return (
    <div className="border-2 border-gray-900 bg-white">
      <div className="border-b-2 border-gray-900 p-4 bg-gray-50">
        <h2 className="text-lg font-serif font-bold text-gray-900 mb-1">🗳️ Who's Your Pick?</h2>
        <p className="text-sm text-gray-600">
          {totalVotes.toLocaleString()} votes from the community
        </p>
      </div>

      <div className="p-4">
        {/* Voting Bars */}
        <div className="space-y-3 mb-4">
          {votes.map((vote) => (
            <button
              key={vote.horseNumber}
              onClick={() => !hasVoted && handleVote(vote.horseNumber)}
              disabled={hasVoted}
              className={`w-full text-left transition-all ${
                hasVoted ? 'cursor-default' : 'cursor-pointer hover:bg-gray-50'
              } ${selectedHorse === vote.horseNumber ? 'ring-2 ring-brand-primary' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">#{vote.horseNumber}</span>
                  <span className="text-sm font-semibold text-gray-900">{vote.horseName}</span>
                  {vote.trending === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
                  {vote.trending === 'down' && <TrendingDown className="w-3 h-3 text-red-600" />}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600">{vote.odds}</span>
                  <span className="text-sm font-bold text-gray-900">{vote.percentage}%</span>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-brand-primary transition-all duration-500"
                  style={{ width: `${vote.percentage}%` }}
                />
              </div>
            </button>
          ))}
        </div>

        {/* CTA */}
        {!hasVoted ? (
          <div className="text-center p-4 bg-gray-50 border border-gray-300">
            <p className="text-sm text-gray-700 mb-2">Cast your vote to see live results</p>
            <button className="text-sm font-semibold text-brand-primary hover:text-brand-primary-intense">
              Sign in to vote →
            </button>
          </div>
        ) : (
          <div className="text-center p-4 bg-brand-primary text-white">
            <p className="text-sm font-semibold">✓ Vote recorded for #{selectedHorse}</p>
            <p className="text-xs mt-1 opacity-90">
              You can change your vote anytime before the race
            </p>
          </div>
        )}

        {/* Market Movement Insight */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200">
          <p className="text-xs text-blue-900">
            💡 <span className="font-semibold">Market trending:</span> #1 Verry Elleegant shortening
            (7/2 → 3/1)
          </p>
        </div>
      </div>
    </div>
  );
}
