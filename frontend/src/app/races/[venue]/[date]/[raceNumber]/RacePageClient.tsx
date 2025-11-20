'use client';

import { useState } from 'react';
import EditorialHeader from '@/components/layout/EditorialHeader';
import ModernFooter from '@/components/layout/ModernFooter';
import RaceHeader from '@/components/race/RaceHeader';
import CommunityVoting from '@/components/race/CommunityVoting';
import AIRacingAnalyst from '@/components/race/AIRacingAnalyst';
import OddsComparison from '@/components/race/OddsComparison';
import SpeedMap from '@/components/race/SpeedMap';
import TrackConditions from '@/components/race/TrackConditions';
import TipsTab from '@/components/race/TipsTab';

interface RacePageClientProps {
  params: {
    venue: string;
    date: string;
    raceNumber: string;
  };
}

type TabId = 'odds' | 'conditions' | 'speed' | 'stats' | 'tips' | 'community' | 'analysis';

export default function RacePageClient({ params }: RacePageClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>('odds');

  // TODO: Fetch race data from API
  // For now, using mock data
  const raceData = {
    venue: params.venue.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    raceNumber: parseInt(params.raceNumber),
    raceName: 'Melbourne Cup',
    time: '3:00 PM AEDT',
    distance: 3200,
    class: 'Group 1',
    prizeMoney: 8000000,
    trackCondition: 'Good 4',
    rail: 'True',
    weather: { temp: 22, condition: 'Sunny', wind: '10km/h NW' },
  };

  const tabs = [
    { id: 'odds', label: 'Odds & Form', priority: 1 },
    { id: 'conditions', label: 'Track & Conditions', priority: 2 },
    { id: 'speed', label: 'Speed Map', priority: 3 },
    { id: 'stats', label: 'Statistics', priority: 4 },
    { id: 'tips', label: 'Expert Tips', priority: 5 },
    { id: 'community', label: 'Community', priority: 6 },
    { id: 'analysis', label: 'AI Analysis', priority: 7 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <EditorialHeader />

      <main className="flex-1">
        {/* Race Header */}
        <RaceHeader race={raceData} />

        {/* Main Content Container */}
        <div className="max-w-[1400px] mx-auto px-6">
          {/* Tab Navigation */}
          <div className="border-b border-brand-ui sticky top-[60px] bg-white z-20">
            <nav className="flex gap-0 overflow-x-auto scrollbar-thin">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-brand-primary text-brand-primary'
                      : 'border-transparent text-gray-600 hover:text-brand-primary hover:bg-brand-light-muted'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="py-8">
            {activeTab === 'odds' && (
              <OddsComparison raceId={`${params.venue}-${params.date}-${params.raceNumber}`} />
            )}
            {activeTab === 'conditions' && (
              <TrackConditions
                venue={raceData.venue}
                distance={raceData.distance}
                raceId={`${params.venue}-${params.date}-${params.raceNumber}`}
              />
            )}
            {activeTab === 'speed' && (
              <SpeedMap raceId={`${params.venue}-${params.date}-${params.raceNumber}`} />
            )}
            {activeTab === 'stats' && (
              <div className="text-gray-600">Advanced statistics coming soon</div>
            )}
            {activeTab === 'tips' && (
              <TipsTab raceId={`${params.venue}-${params.date}-${params.raceNumber}`} />
            )}
            {activeTab === 'community' && (
              <CommunityVoting raceId={`${params.venue}-${params.date}-${params.raceNumber}`} />
            )}
            {activeTab === 'analysis' && (
              <AIRacingAnalyst raceId={`${params.venue}-${params.date}-${params.raceNumber}`} />
            )}
          </div>
        </div>
      </main>

      <ModernFooter />
    </div>
  );
}
