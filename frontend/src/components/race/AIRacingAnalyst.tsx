'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Star, Zap, TrendingUp } from 'lucide-react';

interface AIRacingAnalystProps {
  raceId: string;
}

export default function AIRacingAnalyst({ raceId: _raceId }: AIRacingAnalystProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock data - TODO: Replace with real AI insights from API
  const insights = {
    blackbookHorses: [
      {
        number: 1,
        name: 'Verry Elleegant',
        note: 'Strong recent form with fastest sectionals over final 600m in last 3 runs',
      },
    ],
    keyInsights: [
      { icon: '🎯', text: 'Barrier 5 is optimal (67% strike rate at this distance)' },
      { icon: '🏃', text: 'Track bias today favoring on-pace runners' },
      { icon: '👤', text: 'Jockey McDonald has 30% strike rate at Flemington' },
    ],
    sectionalStandouts: [
      { number: 1, name: 'Verry Elleegant', note: 'Fastest last 600m in recent runs' },
      { number: 5, name: 'Incentivise', note: 'Strong early speed, likely to lead' },
    ],
    userPreferences: [
      { name: 'Sectionals', weight: 'High', color: 'bg-green-500' },
      { name: 'Form', weight: 'Medium', color: 'bg-yellow-500' },
      { name: 'Odds', weight: 'Low', color: 'bg-gray-400' },
    ],
  };

  return (
    <div className="border-2 border-brand-primary bg-white">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <div className="text-left">
            <h2 className="text-lg font-serif font-bold text-gray-900">Your AI Racing Analyst</h2>
            <p className="text-sm text-gray-600">Personalized insights based on your preferences</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t-2 border-brand-primary p-4 space-y-4">
          {/* Blackbook Horses */}
          {insights.blackbookHorses.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                Horses You're Following
              </h3>
              <div className="space-y-2">
                {insights.blackbookHorses.map((horse) => (
                  <div key={horse.number} className="p-3 bg-yellow-50 border border-yellow-200">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-gray-900">#{horse.number}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{horse.name}</p>
                        <p className="text-sm text-gray-700 mt-1">{horse.note}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Insights */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              💡 Insights for This Race
            </h3>
            <div className="space-y-2">
              {insights.keyInsights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span>{insight.icon}</span>
                  <p>{insight.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sectional Standouts */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />
              Sectional Standouts
            </h3>
            <div className="space-y-2">
              {insights.sectionalStandouts.map((horse) => (
                <div key={horse.number} className="flex items-start gap-2 text-sm">
                  <span className="font-bold text-gray-900">#{horse.number}</span>
                  <div>
                    <span className="font-semibold text-gray-900">{horse.name}</span>
                    <p className="text-gray-600">{horse.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Preferences */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Showing Data Weighted to YOUR Preferences
            </h3>
            <div className="flex gap-2 flex-wrap">
              {insights.userPreferences.map((pref) => (
                <div
                  key={pref.name}
                  className="px-3 py-1 bg-gray-100 border border-gray-300 text-xs"
                >
                  <span className="font-semibold">{pref.name}:</span>{' '}
                  <span className={`inline-block w-2 h-2 rounded-full ${pref.color} ml-1`}></span>{' '}
                  {pref.weight}
                </div>
              ))}
            </div>
            <button className="mt-2 text-sm font-semibold text-brand-primary hover:text-brand-primary-intense">
              Customize preferences →
            </button>
          </div>

          {/* CTA for non-members */}
          <div className="mt-4 p-4 bg-gray-50 border border-gray-300 text-center">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Not a member?</strong> Sign up free to unlock personalized AI insights
            </p>
            <button className="px-6 py-2 bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary-intense transition-colors">
              Sign Up Free →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
