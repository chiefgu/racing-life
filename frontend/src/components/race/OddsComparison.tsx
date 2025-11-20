'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface OddsComparisonProps {
  raceId: string;
}

interface PastStart {
  date: string;
  track: string;
  distance: string;
  position: string;
  margin: string;
  jockey: string;
  weight: string;
  prizeMoney: string;
  class: string;
}

interface CareerStats {
  starts: number;
  wins: number;
  places: number;
  shows: number;
  winRate: string;
  prizeMoney: string;
}

interface TrackDistanceRecord {
  thisTrack: { starts: number; wins: number; places: number; shows: number };
  thisDistance: { starts: number; wins: number; places: number; shows: number };
  trackDistance: { starts: number; wins: number; places: number; shows: number };
}

interface Runner {
  number: number;
  name: string;
  jockey: string;
  trainer: string;
  weight: number;
  barrier: number;
  form: string[];
  claim: number | null;
  gear: string[];
  trackDistanceStats: { wins: number; places: number; shows: number } | null;
  emergency: string | null;
  scratched: boolean;
  silks: {
    pattern: 'solid' | 'halves' | 'stripes' | 'quarters' | 'sash' | 'chevron';
    primaryColor: string;
    secondaryColor?: string;
  };
  bestOdds: string;
  bestBookmaker: string;
  bookmakerOdds: { [key: string]: string };
  previousOdds?: { [key: string]: string }; // For tracking price movements
  eachWayTerms?: string; // e.g., "1/5 1-2-3" or "1/4 1-2-3-4"
  pastStarts?: PastStart[];
  careerStats?: CareerStats;
  trackDistanceRecord?: TrackDistanceRecord;
  speedRating?: number;
  classRating?: string;
}

export default function OddsComparison({ raceId: _raceId }: OddsComparisonProps) {
  const [expandedRunners, setExpandedRunners] = useState<Set<number>>(new Set());
  const [expandedFormRunners, setExpandedFormRunners] = useState<Set<number>>(new Set());
  const [lastUpdated] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState<boolean>(false);

  const toggleRunnerForm = (runnerNumber: number) => {
    const newExpanded = new Set(expandedFormRunners);
    if (newExpanded.has(runnerNumber)) {
      newExpanded.delete(runnerNumber);
    } else {
      newExpanded.add(runnerNumber);
    }
    setExpandedFormRunners(newExpanded);
  };

  const toggleRunner = (runnerNumber: number) => {
    const newExpanded = new Set(expandedRunners);
    if (newExpanded.has(runnerNumber)) {
      newExpanded.delete(runnerNumber);
    } else {
      newExpanded.add(runnerNumber);
    }
    setExpandedRunners(newExpanded);
  };

  // Helper function to convert fractional odds to decimal for comparison
  const oddsToDecimal = (odds: string): number => {
    if (!odds || odds === '-') return 0;
    const cleanOdds = odds.replace('$', '').trim();
    if (cleanOdds.includes('/')) {
      const [num, den] = cleanOdds.split('/').map(Number);
      return num / den + 1;
    }
    return parseFloat(cleanOdds);
  };

  // Helper function to determine price movement
  const getPriceMovement = (
    currentOdds: string,
    previousOdds?: string
  ): 'drifting' | 'shortening' | 'stable' => {
    if (!previousOdds || previousOdds === '-' || currentOdds === '-') return 'stable';
    const current = oddsToDecimal(currentOdds);
    const previous = oddsToDecimal(previousOdds);
    if (current > previous) return 'drifting'; // Price getting longer (worse for punter)
    if (current < previous) return 'shortening'; // Price getting shorter (better for punter)
    return 'stable';
  };

  // Format last updated time
  const formatLastUpdated = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Helper function to render jockey silks SVG
  const renderSilks = (silks: Runner['silks']) => {
    const { pattern, primaryColor, secondaryColor = primaryColor } = silks;

    // Silk body shape path
    const silkPath =
      'M 8 2 L 2 2 L 2 6 L 0 8 L 0 22 L 4 22 L 4 28 L 20 28 L 20 22 L 24 22 L 24 8 L 22 6 L 22 2 L 16 2 L 16 0 L 8 0 Z';

    return (
      <svg width="24" height="28" viewBox="0 0 24 28" className="flex-shrink-0">
        <defs>
          <clipPath id={`silk-${pattern}-${primaryColor.replace('#', '')}`}>
            <path d={silkPath} />
          </clipPath>
        </defs>

        {/* Background */}
        <path d={silkPath} fill={primaryColor} stroke="#333" strokeWidth="0.5" />

        {/* Pattern overlays */}
        <g clipPath={`url(#silk-${pattern}-${primaryColor.replace('#', '')})`}>
          {pattern === 'halves' && (
            <rect x="0" y="14" width="24" height="14" fill={secondaryColor} />
          )}

          {pattern === 'stripes' && (
            <>
              <rect x="0" y="0" width="6" height="28" fill={secondaryColor} />
              <rect x="12" y="0" width="6" height="28" fill={secondaryColor} />
            </>
          )}

          {pattern === 'quarters' && (
            <>
              <rect x="12" y="0" width="12" height="14" fill={secondaryColor} />
              <rect x="0" y="14" width="12" height="14" fill={secondaryColor} />
            </>
          )}

          {pattern === 'sash' && <path d="M 0 8 L 24 20 L 24 28 L 0 16 Z" fill={secondaryColor} />}

          {pattern === 'chevron' && (
            <path d="M 12 0 L 24 10 L 24 18 L 12 8 L 0 18 L 0 10 Z" fill={secondaryColor} />
          )}
        </g>

        {/* Outline */}
        <path d={silkPath} fill="none" stroke="#333" strokeWidth="0.5" />
      </svg>
    );
  };

  // Mock bookmakers - TODO: Replace with real data
  const bookmakers = [
    {
      name: 'Bet365',
      short: 'B365',
      logo: '/logos/bet365.png',
      brandColor: '#106E50',
      eachWay: '1/5 1-2-3',
    },
    {
      name: 'Sportsbet',
      short: 'SB',
      logo: '/logos/sportsbet.jpeg',
      brandColor: '#0167AA',
      eachWay: '1/4 1-2-3',
    },
    {
      name: 'TAB',
      short: 'TAB',
      logo: '/logos/tab.png',
      brandColor: '#26E169',
      eachWay: '1/5 1-2-3',
    },
    {
      name: 'Ladbrokes',
      short: 'LB',
      logo: '/logos/ladbrokes.png',
      brandColor: '#D22021',
      eachWay: '1/5 1-2-3',
    },
    { name: 'Neds', short: 'Neds', logo: null, brandColor: '#00A9E0', eachWay: '1/4 1-2-3' },
    { name: 'Unibet', short: 'UB', logo: null, brandColor: '#1D9D5E', eachWay: '1/5 1-2-3' },
    { name: 'Pointsbet', short: 'PB', logo: null, brandColor: '#E31837', eachWay: '1/4 1-2-3' },
    { name: 'BoomBet', short: 'BB', logo: null, brandColor: '#FF6B35', eachWay: '1/5 1-2-3' },
    { name: 'BlueBet', short: 'BlB', logo: null, brandColor: '#0066CC', eachWay: '1/4 1-2-3' },
    { name: 'TopSport', short: 'TS', logo: null, brandColor: '#FFC627', eachWay: '1/5 1-2-3' },
    { name: 'Picklebet', short: 'PkB', logo: null, brandColor: '#7AC142', eachWay: '1/4 1-2-3' },
    { name: 'Betfair', short: 'BF', logo: null, brandColor: '#FFB80C', eachWay: '1/5 1-2-3' },
    { name: 'BetRight', short: 'BR', logo: null, brandColor: '#00B4D8', eachWay: '1/4 1-2-3' },
  ];

  // Mock runners - TODO: Replace with real API data
  const runners: Runner[] = [
    {
      number: 1,
      name: 'Verry Elleegant',
      jockey: 'J. McDonald',
      trainer: 'C. Waller',
      weight: 57,
      barrier: 5,
      form: ['1', '2', '1', '3', '1'],
      claim: null,
      gear: ['B', 'TT'],
      trackDistanceStats: { wins: 2, places: 1, shows: 0 },
      emergency: null,
      scratched: false,
      silks: { pattern: 'halves', primaryColor: '#DC2626', secondaryColor: '#FFFFFF' },
      eachWayTerms: '1/5 1-2-3',
      bestOdds: '$4.00',
      bestBookmaker: 'TAB',
      bookmakerOdds: {
        Bet365: '$3.50',
        Sportsbet: '$3.75',
        TAB: '$4.00',
        Ladbrokes: '$3.60',
        Neds: '$3.80',
        Unibet: '$3.70',
        Pointsbet: '$3.90',
        BoomBet: '$3.65',
        BlueBet: '$3.85',
        TopSport: '$3.75',
        Picklebet: '$3.80',
        Betfair: '$3.55',
        BetRight: '$3.90',
      },
      previousOdds: {
        Bet365: '$4.00', // Shortening (was $4.00, now $3.50)
        Sportsbet: '$4.20', // Shortening
        TAB: '$4.50', // Shortening
        Ladbrokes: '$3.60', // Stable
        Neds: '$3.50', // Drifting (was $3.50, now $3.80)
        Unibet: '$4.00', // Shortening
        Pointsbet: '$4.20', // Shortening
        BoomBet: '$3.50', // Drifting
        BlueBet: '$3.70', // Drifting
        TopSport: '$3.60', // Drifting
        Picklebet: '$3.60', // Drifting
        Betfair: '$3.80', // Shortening
        BetRight: '$3.70', // Drifting
      },
      pastStarts: [
        {
          date: '15 Nov 24',
          track: 'Flemington',
          distance: '2000m',
          position: '2nd',
          margin: '0.5L',
          jockey: 'J. McDonald',
          weight: '57kg',
          prizeMoney: '$500,000',
          class: 'G1',
        },
        {
          date: '3 Nov 24',
          track: 'Randwick',
          distance: '2400m',
          position: '1st',
          margin: '1.5L',
          jockey: 'J. McDonald',
          weight: '56.5kg',
          prizeMoney: '$750,000',
          class: 'G1',
        },
        {
          date: '12 Oct 24',
          track: 'Caulfield',
          distance: '2000m',
          position: '1st',
          margin: '2.0L',
          jockey: 'J. McDonald',
          weight: '57kg',
          prizeMoney: '$1,000,000',
          class: 'G1',
        },
        {
          date: '28 Sep 24',
          track: 'Flemington',
          distance: '1600m',
          position: '3rd',
          margin: '2.5L',
          jockey: 'J. McDonald',
          weight: '56kg',
          prizeMoney: '$300,000',
          class: 'G2',
        },
        {
          date: '14 Sep 24',
          track: 'Randwick',
          distance: '2000m',
          position: '1st',
          margin: '3.0L',
          jockey: 'D. Lane',
          weight: '55.5kg',
          prizeMoney: '$500,000',
          class: 'G1',
        },
      ],
      careerStats: {
        starts: 28,
        wins: 15,
        places: 8,
        shows: 3,
        winRate: '53.6%',
        prizeMoney: '$14,500,000',
      },
      trackDistanceRecord: {
        thisTrack: { starts: 5, wins: 3, places: 1, shows: 1 },
        thisDistance: { starts: 12, wins: 7, places: 3, shows: 1 },
        trackDistance: { starts: 3, wins: 2, places: 1, shows: 0 },
      },
      speedRating: 118,
      classRating: 'Group 1',
    },
    {
      number: 5,
      name: 'Incentivise',
      jockey: 'M. Zahra',
      trainer: 'P. Moody',
      weight: 56,
      barrier: 12,
      form: ['1', '1', '2', '1', '4'],
      claim: null,
      gear: ['V', 'NR'],
      trackDistanceStats: { wins: 3, places: 2, shows: 1 },
      emergency: null,
      scratched: false,
      silks: { pattern: 'stripes', primaryColor: '#1E40AF', secondaryColor: '#FBBF24' },
      eachWayTerms: '1/5 1-2-3',
      bestOdds: '$4.50',
      bestBookmaker: 'Bet365',
      bookmakerOdds: {
        Bet365: '$4.50',
        Sportsbet: '$4.00',
        TAB: '$4.20',
        Ladbrokes: '$4.10',
        Neds: '$4.30',
        Unibet: '$4.25',
        Pointsbet: '$4.50',
        BoomBet: '$4.15',
        BlueBet: '$4.35',
        TopSport: '$4.20',
        Picklebet: '$4.25',
        Betfair: '$4.05',
        BetRight: '$4.40',
      },
      previousOdds: {
        Bet365: '$4.20', // Drifting
        Sportsbet: '$4.50', // Shortening (was $4.50, now $4.00)
        TAB: '$4.60', // Shortening
        Ladbrokes: '$4.10', // Stable
        Neds: '$4.00', // Drifting
        Unibet: '$4.25', // Stable
        Pointsbet: '$4.50', // Stable
        BoomBet: '$4.50', // Shortening
        BlueBet: '$4.35', // Stable
        TopSport: '$4.60', // Shortening
        Picklebet: '$4.25', // Stable
        Betfair: '$4.40', // Shortening
        BetRight: '$4.40', // Stable
      },
      pastStarts: [
        {
          date: '10 Nov 24',
          track: 'Caulfield',
          distance: '2400m',
          position: '1st',
          margin: '2.5L',
          jockey: 'M. Zahra',
          weight: '56kg',
          prizeMoney: '$1,000,000',
          class: 'G1',
        },
        {
          date: '28 Oct 24',
          track: 'Flemington',
          distance: '2000m',
          position: '1st',
          margin: '1.0L',
          jockey: 'M. Zahra',
          weight: '56.5kg',
          prizeMoney: '$500,000',
          class: 'G2',
        },
        {
          date: '14 Oct 24',
          track: 'Randwick',
          distance: '2400m',
          position: '2nd',
          margin: '0.2L',
          jockey: 'M. Zahra',
          weight: '56kg',
          prizeMoney: '$750,000',
          class: 'G1',
        },
        {
          date: '30 Sep 24',
          track: 'Caulfield',
          distance: '2000m',
          position: '1st',
          margin: '3.5L',
          jockey: 'M. Zahra',
          weight: '55.5kg',
          prizeMoney: '$600,000',
          class: 'G2',
        },
        {
          date: '16 Sep 24',
          track: 'Rosehill',
          distance: '2400m',
          position: '4th',
          margin: '4.0L',
          jockey: 'M. Zahra',
          weight: '56kg',
          prizeMoney: '$400,000',
          class: 'G1',
        },
      ],
      careerStats: {
        starts: 22,
        wins: 12,
        places: 6,
        shows: 2,
        winRate: '54.5%',
        prizeMoney: '$12,800,000',
      },
      trackDistanceRecord: {
        thisTrack: { starts: 4, wins: 3, places: 0, shows: 1 },
        thisDistance: { starts: 10, wins: 6, places: 2, shows: 1 },
        trackDistance: { starts: 2, wins: 2, places: 0, shows: 0 },
      },
      speedRating: 116,
      classRating: 'Group 1',
    },
    {
      number: 7,
      name: 'Spanish Mission',
      jockey: 'C. Williams',
      trainer: 'A. Balding',
      weight: 55.5,
      barrier: 8,
      form: ['3', '5', '2', '1', '6'],
      claim: 2,
      gear: ['TT', 'EM'],
      trackDistanceStats: null,
      emergency: null,
      scratched: false,
      silks: { pattern: 'sash', primaryColor: '#059669', secondaryColor: '#FFFFFF' },
      eachWayTerms: '1/4 1-2-3-4',
      bestOdds: '$12.00',
      bestBookmaker: 'Bet365',
      bookmakerOdds: {
        Bet365: '$12.00',
        Sportsbet: '$11.50',
        TAB: '$11.00',
        Ladbrokes: '$11.50',
        Neds: '$12.00',
        Unibet: '$11.50',
        Pointsbet: '$12.00',
        BoomBet: '$11.50',
        BlueBet: '$12.00',
        TopSport: '$11.50',
        Picklebet: '$11.50',
        Betfair: '$11.00',
        BetRight: '$12.00',
      },
      previousOdds: {
        Bet365: '$11.00', // Drifting
        Sportsbet: '$11.50', // Stable
        TAB: '$13.00', // Shortening (was $13.00, now $11.00)
        Ladbrokes: '$13.00', // Shortening
        Neds: '$11.00', // Drifting
        Unibet: '$13.00', // Shortening
        Pointsbet: '$11.00', // Drifting
        BoomBet: '$11.50', // Stable
        BlueBet: '$11.00', // Drifting
        TopSport: '$11.50', // Stable
        Picklebet: '$11.50', // Stable
        Betfair: '$13.00', // Shortening
        BetRight: '$11.00', // Drifting
      },
      pastStarts: [
        {
          date: '8 Nov 24',
          track: 'Flemington',
          distance: '1600m',
          position: '3rd',
          margin: '1.8L',
          jockey: 'C. Williams',
          weight: '55.5kg',
          prizeMoney: '$200,000',
          class: 'G3',
        },
        {
          date: '22 Oct 24',
          track: 'Caulfield',
          distance: '2000m',
          position: '5th',
          margin: '3.5L',
          jockey: 'C. Williams',
          weight: '55kg',
          prizeMoney: '$300,000',
          class: 'G2',
        },
        {
          date: '7 Oct 24',
          track: 'Randwick',
          distance: '2400m',
          position: '2nd',
          margin: '0.8L',
          jockey: 'C. Williams',
          weight: '56kg',
          prizeMoney: '$500,000',
          class: 'G2',
        },
        {
          date: '23 Sep 24',
          track: 'Rosehill',
          distance: '2000m',
          position: '1st',
          margin: '1.2L',
          jockey: 'C. Williams',
          weight: '54.5kg',
          prizeMoney: '$400,000',
          class: 'G3',
        },
        {
          date: '9 Sep 24',
          track: 'Flemington',
          distance: '1800m',
          position: '6th',
          margin: '5.0L',
          jockey: 'B. Avdulla',
          weight: '55kg',
          prizeMoney: '$250,000',
          class: 'G3',
        },
      ],
      careerStats: {
        starts: 18,
        wins: 5,
        places: 6,
        shows: 3,
        winRate: '27.8%',
        prizeMoney: '$3,200,000',
      },
      trackDistanceRecord: {
        thisTrack: { starts: 2, wins: 0, places: 1, shows: 1 },
        thisDistance: { starts: 6, wins: 2, places: 2, shows: 1 },
        trackDistance: { starts: 1, wins: 0, places: 0, shows: 1 },
      },
      speedRating: 108,
      classRating: 'Group 3',
    },
    {
      number: 12,
      name: 'Anamoe',
      jockey: 'J. Bowman',
      trainer: 'J. Cummings',
      weight: 56.5,
      barrier: 3,
      form: ['2', '1', '1', '3', '2'],
      claim: null,
      gear: ['B', 'V', 'TT'],
      trackDistanceStats: { wins: 1, places: 2, shows: 1 },
      emergency: null,
      scratched: false,
      silks: { pattern: 'quarters', primaryColor: '#7C3AED', secondaryColor: '#FFFFFF' },
      eachWayTerms: '1/5 1-2-3',
      bestOdds: '$7.00',
      bestBookmaker: 'Bet365',
      bookmakerOdds: {
        Bet365: '$7.00',
        Sportsbet: '$6.75',
        TAB: '$7.00',
        Ladbrokes: '$6.80',
        Neds: '$6.50',
        Unibet: '$6.90',
        Pointsbet: '$7.00',
        BoomBet: '$6.75',
        BlueBet: '$7.00',
        TopSport: '$6.80',
        Picklebet: '$6.90',
        Betfair: '$6.60',
        BetRight: '$7.00',
      },
      previousOdds: {
        Bet365: '$7.50', // Shortening
        Sportsbet: '$7.00', // Shortening
        TAB: '$7.50', // Shortening
        Ladbrokes: '$6.80', // Stable
        Neds: '$7.00', // Shortening (was $7.00, now $6.50)
        Unibet: '$7.50', // Shortening
        Pointsbet: '$6.50', // Drifting
        BoomBet: '$7.00', // Shortening
        BlueBet: '$6.50', // Drifting
        TopSport: '$7.00', // Shortening
        Picklebet: '$6.90', // Stable
        Betfair: '$7.00', // Shortening
        BetRight: '$6.50', // Drifting
      },
      pastStarts: [
        {
          date: '12 Nov 24',
          track: 'Randwick',
          distance: '1600m',
          position: '2nd',
          margin: '0.3L',
          jockey: 'J. Bowman',
          weight: '56.5kg',
          prizeMoney: '$600,000',
          class: 'G1',
        },
        {
          date: '28 Oct 24',
          track: 'Caulfield',
          distance: '2000m',
          position: '1st',
          margin: '1.5L',
          jockey: 'J. Bowman',
          weight: '56kg',
          prizeMoney: '$800,000',
          class: 'G1',
        },
        {
          date: '14 Oct 24',
          track: 'Flemington',
          distance: '1600m',
          position: '1st',
          margin: '2.0L',
          jockey: 'J. Bowman',
          weight: '56.5kg',
          prizeMoney: '$500,000',
          class: 'G2',
        },
        {
          date: '30 Sep 24',
          track: 'Randwick',
          distance: '1400m',
          position: '3rd',
          margin: '1.5L',
          jockey: 'J. Bowman',
          weight: '56kg',
          prizeMoney: '$400,000',
          class: 'G1',
        },
        {
          date: '16 Sep 24',
          track: 'Rosehill',
          distance: '1600m',
          position: '2nd',
          margin: '0.5L',
          jockey: 'J. Bowman',
          weight: '56.5kg',
          prizeMoney: '$750,000',
          class: 'G1',
        },
      ],
      careerStats: {
        starts: 20,
        wins: 11,
        places: 7,
        shows: 1,
        winRate: '55.0%',
        prizeMoney: '$9,500,000',
      },
      trackDistanceRecord: {
        thisTrack: { starts: 6, wins: 4, places: 1, shows: 1 },
        thisDistance: { starts: 8, wins: 5, places: 2, shows: 0 },
        trackDistance: { starts: 3, wins: 2, places: 1, shows: 0 },
      },
      speedRating: 115,
      classRating: 'Group 1',
    },
  ];

  return (
    <div className="border border-brand-ui bg-white">
      {/* Header with Title */}
      <div className="border-b border-brand-ui p-4 bg-brand-light">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-gray-900">Odds & Form</h2>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setExpandedFormRunners(new Set()); // Clear individual states when using master control
            }}
            className="px-3 py-1.5 text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors"
          >
            {showForm ? 'Hide Form' : 'Show Form'}
          </button>
        </div>
      </div>

      {/* Desktop View - Odds Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-brand-ui bg-brand-light">
              <th className="text-left py-2 px-3 font-semibold text-gray-900 sticky left-0 bg-brand-light z-10 w-[180px]">
                Runner
              </th>
              <th className="text-left py-2 px-2 font-semibold text-gray-700 w-[100px]">
                Jockey/Trainer
              </th>
              <th className="text-left py-2 px-2 font-semibold text-gray-700 w-[160px]">
                Information
              </th>
              {bookmakers.map((bookie, idx) => (
                <th
                  key={bookie.name}
                  className={`p-0 ${idx === 0 ? 'border-l border-brand-ui' : ''}`}
                  title={bookie.name}
                >
                  <div
                    className="h-full w-full flex items-center justify-center py-3 px-2"
                    style={{ backgroundColor: bookie.brandColor }}
                  >
                    {bookie.logo ? (
                      <div className="relative w-full h-10 flex items-center justify-center">
                        <Image
                          src={bookie.logo}
                          alt={bookie.name}
                          width={70}
                          height={40}
                          className="object-contain"
                          style={{ maxHeight: '36px', width: 'auto' }}
                        />
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-white">{bookie.short}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
            {/* Each Way Terms Row */}
            <tr className="border-b border-brand-ui bg-brand-light">
              <th className="text-left py-1.5 px-3 text-[10px] font-semibold text-gray-700 sticky left-0 bg-brand-light z-10">
                Each Way
              </th>
              <th className="py-1.5 px-2"></th>
              <th className="py-1.5 px-2"></th>
              {bookmakers.map((bookie, idx) => (
                <th
                  key={bookie.name}
                  className={`text-center py-1.5 px-1 text-[10px] font-medium text-gray-600 ${idx === 0 ? 'border-l border-brand-ui' : ''}`}
                >
                  {bookie.eachWay}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-ui">
            {runners.map((runner) => (
              <React.Fragment key={runner.number}>
                <tr className="hover:bg-brand-light transition-colors">
                  {/* Runner Column - Sticky */}
                  <td className="py-2 px-3 sticky left-0 bg-white hover:bg-brand-light transition-colors z-10">
                    <div className="flex gap-2">
                      {/* Jockey Silks - Centered vertically */}
                      <div className="self-center flex-shrink-0">{renderSilks(runner.silks)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-sm font-bold text-brand-primary">
                            #{runner.number}
                          </span>
                          <span className="text-sm font-semibold text-gray-900 truncate">
                            {runner.name}
                          </span>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            ({runner.barrier})
                          </span>
                        </div>
                        {/* Form */}
                        <div className="flex items-center gap-0.5">
                          {runner.form.map((result, idx) => (
                            <span
                              key={idx}
                              className={`w-4 h-4 flex items-center justify-center text-[9px] font-bold ${
                                result === '1'
                                  ? 'bg-green-600 text-white'
                                  : result === '2'
                                    ? 'bg-blue-700 text-white'
                                    : result === '3'
                                      ? 'bg-orange-600 text-white'
                                      : 'bg-gray-400 text-white'
                              }`}
                            >
                              {result}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Details Column */}
                  <td className="py-2 px-2 text-[10px] text-gray-600 leading-tight">
                    <div className="truncate">J: {runner.jockey}</div>
                    <div className="truncate">T: {runner.trainer}</div>
                  </td>

                  {/* Information Column */}
                  <td className="py-2 px-2 text-[10px] leading-tight">
                    <div className="flex items-center gap-0.5">
                      {/* Left side - Information */}
                      <div className="w-[120px]">
                        {/* Weight & Claim */}
                        <div className="text-gray-700 font-semibold mb-0.5">
                          {runner.weight}kg{runner.claim ? ` (a${runner.claim})` : ''}
                        </div>

                        {/* Gear */}
                        {runner.gear.length > 0 && (
                          <div className="flex flex-wrap gap-0.5 mb-0.5">
                            {runner.gear.map((gear, idx) => {
                              const gearName =
                                gear === 'B'
                                  ? 'Blinkers'
                                  : gear === 'V'
                                    ? 'Visor'
                                    : gear === 'TT'
                                      ? 'Tongue Tie'
                                      : gear === 'NR'
                                        ? 'Nose Roll'
                                        : gear === 'EM'
                                          ? 'Ear Muffs'
                                          : gear === 'LP'
                                            ? 'Lugging Bit'
                                            : gear === 'P'
                                              ? 'Pacifiers'
                                              : gear === 'BP'
                                                ? 'Bar Plates'
                                                : gear === 'CN'
                                                  ? 'Cross-over Nose Band'
                                                  : gear;
                              return (
                                <span
                                  key={idx}
                                  className="relative group px-1 py-0.5 bg-brand-primary text-white text-[8px] font-bold uppercase cursor-help"
                                >
                                  {gear}
                                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-[10px] font-normal normal-case whitespace-nowrap rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 pointer-events-none z-50">
                                    {gearName}
                                  </span>
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Track/Distance Stats */}
                        {runner.trackDistanceStats && (
                          <div className="text-gray-600 text-[9px]">
                            T/D: {runner.trackDistanceStats.wins}-{runner.trackDistanceStats.places}
                            -{runner.trackDistanceStats.shows}
                          </div>
                        )}

                        {/* Emergency Badge */}
                        {runner.emergency && (
                          <div className="inline-block px-1 py-0.5 bg-orange-500 text-white text-[8px] font-bold mt-0.5">
                            {runner.emergency}
                          </div>
                        )}

                        {/* Scratched Badge */}
                        {runner.scratched && (
                          <div className="inline-block px-1 py-0.5 bg-red-600 text-white text-[8px] font-bold mt-0.5">
                            SCR
                          </div>
                        )}
                      </div>

                      {/* Right side - Form Toggle */}
                      <div className="flex-shrink-0">
                        {runner.pastStarts && (
                          <button
                            onClick={() => toggleRunnerForm(runner.number)}
                            className="flex items-center gap-1 text-[10px] text-brand-primary hover:text-brand-primary/80 font-semibold transition-colors"
                            title={
                              showForm !== expandedFormRunners.has(runner.number)
                                ? 'Hide form'
                                : 'Show form'
                            }
                          >
                            {showForm !== expandedFormRunners.has(runner.number) ? (
                              <>
                                <ChevronUp className="w-3.5 h-3.5" />
                                <span>Hide</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3.5 h-3.5" />
                                <span>Full Form</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Bookmaker Odds Columns */}
                  {bookmakers.map((bookie, idx) => {
                    const odds = runner.bookmakerOdds[bookie.name];
                    const previousOdds = runner.previousOdds?.[bookie.name];
                    const movement = getPriceMovement(odds, previousOdds);

                    // Find the best (highest) odds for this runner
                    const allOddsValues = Object.values(runner.bookmakerOdds).map(oddsToDecimal);
                    const bestOddsValue = Math.max(...allOddsValues);
                    const currentOddsValue = oddsToDecimal(odds);
                    const isBest = currentOddsValue === bestOddsValue && currentOddsValue > 0;

                    // Determine background color based on movement and best odds
                    let bgColor = 'bg-blue-100'; // Default to shortening color if no movement detected
                    let borderColor = '';
                    if (isBest) {
                      bgColor = 'bg-[#F5E6D3]'; // Best odds - pale champagne
                      borderColor = 'border border-[#D4AF37]'; // Gold border
                    } else if (movement === 'drifting') {
                      bgColor = 'bg-red-50'; // Drifting - pale red
                    } else if (movement === 'shortening') {
                      bgColor = 'bg-blue-100'; // Shortening - more visible blue
                    }
                    // If stable, it will use the default bgColor (blue-100)

                    return (
                      <td
                        key={bookie.name}
                        className={`text-center py-2 px-1 ${idx === 0 ? 'border-l border-brand-ui' : ''}`}
                      >
                        <div className="relative group">
                          <a
                            href={`https://${bookie.name.toLowerCase()}.com`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-block px-1.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${bgColor} ${borderColor} ${
                              isBest
                                ? 'text-gray-900 hover:brightness-95'
                                : 'text-gray-700 hover:text-brand-primary hover:brightness-95'
                            }`}
                          >
                            {odds}
                          </a>
                          {previousOdds && previousOdds !== odds && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-[10px] whitespace-nowrap rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 pointer-events-none z-50">
                              Was {previousOdds}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Expanded Form Section */}
                {showForm !== expandedFormRunners.has(runner.number) && runner.pastStarts && (
                  <tr className="bg-brand-light/50">
                    <td colSpan={3 + bookmakers.length} className="p-4">
                      <div className="space-y-4">
                        {/* Career Statistics */}
                        {runner.careerStats && (
                          <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-2">
                              Career Statistics
                            </h3>
                            <div className="grid grid-cols-6 gap-4 text-xs">
                              <div>
                                <div className="text-gray-600">Record</div>
                                <div className="font-semibold text-gray-900">
                                  {runner.careerStats.starts}-{runner.careerStats.wins}-
                                  {runner.careerStats.places}-{runner.careerStats.shows}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-600">Win Rate</div>
                                <div className="font-semibold text-gray-900">
                                  {runner.careerStats.winRate}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-600">Prize Money</div>
                                <div className="font-semibold text-gray-900">
                                  {runner.careerStats.prizeMoney}
                                </div>
                              </div>
                              {runner.speedRating && (
                                <div>
                                  <div className="text-gray-600">Speed Rating</div>
                                  <div className="font-semibold text-gray-900">
                                    {runner.speedRating}
                                  </div>
                                </div>
                              )}
                              {runner.classRating && (
                                <div>
                                  <div className="text-gray-600">Class</div>
                                  <div className="font-semibold text-gray-900">
                                    {runner.classRating}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Track/Distance Records */}
                        {runner.trackDistanceRecord && (
                          <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-2">
                              Track & Distance Record
                            </h3>
                            <div className="grid grid-cols-3 gap-4 text-xs">
                              <div>
                                <div className="text-gray-600">This Track</div>
                                <div className="font-semibold text-gray-900">
                                  {runner.trackDistanceRecord.thisTrack.starts}-
                                  {runner.trackDistanceRecord.thisTrack.wins}-
                                  {runner.trackDistanceRecord.thisTrack.places}-
                                  {runner.trackDistanceRecord.thisTrack.shows}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-600">This Distance</div>
                                <div className="font-semibold text-gray-900">
                                  {runner.trackDistanceRecord.thisDistance.starts}-
                                  {runner.trackDistanceRecord.thisDistance.wins}-
                                  {runner.trackDistanceRecord.thisDistance.places}-
                                  {runner.trackDistanceRecord.thisDistance.shows}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-600">Track/Distance</div>
                                <div className="font-semibold text-gray-900">
                                  {runner.trackDistanceRecord.trackDistance.starts}-
                                  {runner.trackDistanceRecord.trackDistance.wins}-
                                  {runner.trackDistanceRecord.trackDistance.places}-
                                  {runner.trackDistanceRecord.trackDistance.shows}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Last 5 Starts */}
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 mb-2">Last 5 Starts</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-brand-ui">
                                  <th className="text-left py-1 px-2 font-semibold text-gray-700">
                                    Date
                                  </th>
                                  <th className="text-left py-1 px-2 font-semibold text-gray-700">
                                    Track
                                  </th>
                                  <th className="text-left py-1 px-2 font-semibold text-gray-700">
                                    Dist
                                  </th>
                                  <th className="text-left py-1 px-2 font-semibold text-gray-700">
                                    Pos
                                  </th>
                                  <th className="text-left py-1 px-2 font-semibold text-gray-700">
                                    Margin
                                  </th>
                                  <th className="text-left py-1 px-2 font-semibold text-gray-700">
                                    Jockey
                                  </th>
                                  <th className="text-left py-1 px-2 font-semibold text-gray-700">
                                    Weight
                                  </th>
                                  <th className="text-left py-1 px-2 font-semibold text-gray-700">
                                    Class
                                  </th>
                                  <th className="text-right py-1 px-2 font-semibold text-gray-700">
                                    Prize
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {runner.pastStarts.map((start, idx) => (
                                  <tr
                                    key={idx}
                                    className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                  >
                                    <td className="py-1 px-2 text-gray-900">{start.date}</td>
                                    <td className="py-1 px-2 text-gray-900">{start.track}</td>
                                    <td className="py-1 px-2 text-gray-900">{start.distance}</td>
                                    <td className="py-1 px-2">
                                      <span
                                        className={`font-semibold ${
                                          start.position.startsWith('1')
                                            ? 'text-green-600'
                                            : start.position.startsWith('2')
                                              ? 'text-blue-700'
                                              : start.position.startsWith('3')
                                                ? 'text-orange-600'
                                                : 'text-gray-900'
                                        }`}
                                      >
                                        {start.position}
                                      </span>
                                    </td>
                                    <td className="py-1 px-2 text-gray-900">{start.margin}</td>
                                    <td className="py-1 px-2 text-gray-900">{start.jockey}</td>
                                    <td className="py-1 px-2 text-gray-900">{start.weight}</td>
                                    <td className="py-1 px-2">
                                      <span className="inline-block px-1 py-0.5 bg-brand-primary text-white text-[9px] font-bold">
                                        {start.class}
                                      </span>
                                    </td>
                                    <td className="py-1 px-2 text-gray-900 text-right">
                                      {start.prizeMoney}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Note - Desktop */}
      <div className="hidden md:block border-t border-brand-ui p-3 bg-brand-light text-xs text-gray-600">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p>
            Odds correct as of{' '}
            <span className="font-semibold">{formatLastUpdated(lastUpdated)}</span>. Hover over odds
            to see previous prices.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 bg-[#F5E6D3] border border-[#D4AF37]"></span>
              <span className="text-[10px]">Best Odds</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 bg-blue-100 border border-gray-200"></span>
              <span className="text-[10px]">Shortening</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 bg-red-50 border border-gray-200"></span>
              <span className="text-[10px]">Drifting</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View - Vertical List */}
      <div className="md:hidden">
        {runners.map((runner) => {
          const isExpanded = expandedRunners.has(runner.number);
          const bestBookieData = bookmakers.find((b) => b.name === runner.bestBookmaker);

          return (
            <div key={runner.number} className="border-b border-brand-ui">
              {/* Runner Header - Always Visible */}
              <div className="p-3 bg-white">
                <div className="flex items-start gap-3">
                  {/* Jockey Silks */}
                  <div className="flex-shrink-0 self-center">{renderSilks(runner.silks)}</div>

                  {/* Runner Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-brand-primary">#{runner.number}</span>
                      <span className="text-sm font-semibold text-gray-900">{runner.name}</span>
                      <span className="text-xs text-gray-500">({runner.barrier})</span>
                    </div>

                    {/* Form */}
                    <div className="flex items-center gap-0.5 mb-2">
                      {runner.form.map((result, idx) => (
                        <span
                          key={idx}
                          className={`w-4 h-4 flex items-center justify-center text-[9px] font-bold ${
                            result === '1'
                              ? 'bg-green-600 text-white'
                              : result === '2'
                                ? 'bg-blue-700 text-white'
                                : result === '3'
                                  ? 'bg-orange-600 text-white'
                                  : 'bg-gray-400 text-white'
                          }`}
                        >
                          {result}
                        </span>
                      ))}
                    </div>

                    {/* Jockey/Trainer */}
                    <div className="text-xs text-gray-600 mb-1">
                      <div>J: {runner.jockey}</div>
                      <div>T: {runner.trainer}</div>
                    </div>

                    {/* Weight & Gear */}
                    <div className="text-xs text-gray-700">
                      <span className="font-semibold">
                        {runner.weight}kg{runner.claim ? ` (a${runner.claim})` : ''}
                      </span>
                      {runner.gear.length > 0 && (
                        <span className="ml-2">
                          {runner.gear.map((gear, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-1 bg-brand-primary text-white text-[8px] font-bold ml-1"
                            >
                              {gear}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>

                    {/* Form Toggle - Mobile */}
                    {runner.pastStarts && (
                      <button
                        onClick={() => toggleRunnerForm(runner.number)}
                        className="mt-2 flex items-center gap-1 text-[10px] text-brand-primary hover:text-brand-primary/80 font-semibold transition-colors"
                      >
                        {showForm !== expandedFormRunners.has(runner.number) ? (
                          <>
                            <ChevronUp className="w-3 h-3" />
                            <span>Hide Full Form</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            <span>Full Form</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Best Odds */}
                  <div className="flex-shrink-0">
                    <div
                      className="px-3 py-2 text-center"
                      style={{ backgroundColor: bestBookieData?.brandColor }}
                    >
                      <div className="text-xs font-bold text-white mb-1">
                        {bestBookieData?.short}
                      </div>
                      <div className="text-lg font-bold text-white">{runner.bestOdds}</div>
                      {runner.eachWayTerms && (
                        <div className="text-[9px] text-white opacity-90 mt-1">
                          EW: {runner.eachWayTerms}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => toggleRunner(runner.number)}
                  className="w-full mt-3 py-2 flex items-center justify-center gap-2 text-sm font-semibold text-brand-primary border-t border-brand-ui hover:bg-brand-light transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Hide All Odds
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      View All Odds
                    </>
                  )}
                </button>
              </div>

              {/* Expanded Odds - All Bookmakers */}
              {isExpanded && (
                <div className="bg-brand-light p-3 border-t border-brand-ui">
                  <div className="grid grid-cols-2 gap-2">
                    {bookmakers.map((bookie) => {
                      const odds = runner.bookmakerOdds[bookie.name];
                      const previousOdds = runner.previousOdds?.[bookie.name];
                      const movement = getPriceMovement(odds, previousOdds);

                      // Find the best (highest) odds for this runner
                      const allOddsValues = Object.values(runner.bookmakerOdds).map(oddsToDecimal);
                      const bestOddsValue = Math.max(...allOddsValues);
                      const currentOddsValue = oddsToDecimal(odds);
                      const isBest = currentOddsValue === bestOddsValue && currentOddsValue > 0;

                      let bgColor = 'bg-blue-100';
                      let borderColor = '';
                      if (isBest) {
                        bgColor = 'bg-[#F5E6D3]';
                        borderColor = 'border border-[#D4AF37]';
                      } else if (movement === 'drifting') {
                        bgColor = 'bg-red-50';
                      } else if (movement === 'shortening') {
                        bgColor = 'bg-blue-100';
                      }

                      return (
                        <a
                          key={bookie.name}
                          href={`https://${bookie.name.toLowerCase()}.com`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-2 ${bgColor} ${borderColor} transition-colors block`}
                        >
                          <div className="text-[10px] font-semibold text-gray-700 mb-1">
                            {bookie.name}
                          </div>
                          <div className="text-sm font-bold text-gray-900">{odds}</div>
                          {previousOdds && previousOdds !== odds && (
                            <div className="text-[9px] text-gray-500 mt-0.5">
                              Was {previousOdds}
                            </div>
                          )}
                          {bookie.eachWay && (
                            <div className="text-[9px] text-gray-600 mt-1">
                              EW: {bookie.eachWay}
                            </div>
                          )}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Expanded Form Section - Mobile */}
              {showForm !== expandedFormRunners.has(runner.number) && runner.pastStarts && (
                <div className="bg-brand-light/50 p-3 border-t border-brand-ui">
                  <div className="space-y-3">
                    {/* Career Statistics */}
                    {runner.careerStats && (
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-2">Career Statistics</h3>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white p-2">
                            <div className="text-gray-600">Record</div>
                            <div className="font-semibold text-gray-900">
                              {runner.careerStats.starts}-{runner.careerStats.wins}-
                              {runner.careerStats.places}-{runner.careerStats.shows}
                            </div>
                          </div>
                          <div className="bg-white p-2">
                            <div className="text-gray-600">Win Rate</div>
                            <div className="font-semibold text-gray-900">
                              {runner.careerStats.winRate}
                            </div>
                          </div>
                          <div className="bg-white p-2">
                            <div className="text-gray-600">Prize Money</div>
                            <div className="font-semibold text-gray-900">
                              {runner.careerStats.prizeMoney}
                            </div>
                          </div>
                          {runner.speedRating && (
                            <div className="bg-white p-2">
                              <div className="text-gray-600">Speed Rating</div>
                              <div className="font-semibold text-gray-900">
                                {runner.speedRating}
                              </div>
                            </div>
                          )}
                          {runner.classRating && (
                            <div className="bg-white p-2">
                              <div className="text-gray-600">Class</div>
                              <div className="font-semibold text-gray-900">
                                {runner.classRating}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Track/Distance Records */}
                    {runner.trackDistanceRecord && (
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-2">
                          Track & Distance Record
                        </h3>
                        <div className="grid grid-cols-1 gap-2 text-xs">
                          <div className="bg-white p-2">
                            <div className="text-gray-600">This Track</div>
                            <div className="font-semibold text-gray-900">
                              {runner.trackDistanceRecord.thisTrack.starts}-
                              {runner.trackDistanceRecord.thisTrack.wins}-
                              {runner.trackDistanceRecord.thisTrack.places}-
                              {runner.trackDistanceRecord.thisTrack.shows}
                            </div>
                          </div>
                          <div className="bg-white p-2">
                            <div className="text-gray-600">This Distance</div>
                            <div className="font-semibold text-gray-900">
                              {runner.trackDistanceRecord.thisDistance.starts}-
                              {runner.trackDistanceRecord.thisDistance.wins}-
                              {runner.trackDistanceRecord.thisDistance.places}-
                              {runner.trackDistanceRecord.thisDistance.shows}
                            </div>
                          </div>
                          <div className="bg-white p-2">
                            <div className="text-gray-600">Track/Distance</div>
                            <div className="font-semibold text-gray-900">
                              {runner.trackDistanceRecord.trackDistance.starts}-
                              {runner.trackDistanceRecord.trackDistance.wins}-
                              {runner.trackDistanceRecord.trackDistance.places}-
                              {runner.trackDistanceRecord.trackDistance.shows}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Last 5 Starts */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-2">Last 5 Starts</h3>
                      <div className="space-y-2">
                        {runner.pastStarts.map((start, idx) => (
                          <div key={idx} className="bg-white p-2 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-gray-900">{start.date}</span>
                              <span
                                className={`font-bold ${
                                  start.position.startsWith('1')
                                    ? 'text-green-600'
                                    : start.position.startsWith('2')
                                      ? 'text-blue-700'
                                      : start.position.startsWith('3')
                                        ? 'text-orange-600'
                                        : 'text-gray-900'
                                }`}
                              >
                                {start.position} ({start.margin})
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-gray-600">
                              <div>
                                Track: <span className="text-gray-900">{start.track}</span>
                              </div>
                              <div>
                                Dist: <span className="text-gray-900">{start.distance}</span>
                              </div>
                              <div>
                                Jockey: <span className="text-gray-900">{start.jockey}</span>
                              </div>
                              <div>
                                Weight: <span className="text-gray-900">{start.weight}</span>
                              </div>
                              <div>
                                Class:{' '}
                                <span className="inline-block px-1 py-0.5 bg-brand-primary text-white text-[9px] font-bold ml-1">
                                  {start.class}
                                </span>
                              </div>
                              <div>
                                Prize: <span className="text-gray-900">{start.prizeMoney}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
