'use client';

import OddsComparisonWidget from '@/components/chat/OddsComparisonWidget';
import FormGuideCard from '@/components/chat/FormGuideCard';
import HorseComparison from '@/components/chat/HorseComparison';
import TrackConditionsWidget from '@/components/chat/TrackConditionsWidget';
import JockeyStatsWidget from '@/components/chat/JockeyStatsWidget';
import RaceInfoWidget from '@/components/chat/RaceInfoWidget';
import RaceResultWidget from '@/components/chat/RaceResultWidget';
import HeadToHeadWidget from '@/components/chat/HeadToHeadWidget';
import BookmakerComparisonWidget from '@/components/chat/BookmakerComparisonWidget';
import MarketMoversWidget from '@/components/chat/MarketMoversWidget';
import SpeedMapWidget from '@/components/chat/SpeedMapWidget';
import GearChangesWidget from '@/components/chat/GearChangesWidget';
import BarrierStatsWidget from '@/components/chat/BarrierStatsWidget';
import TrackBiasWidget from '@/components/chat/TrackBiasWidget';
import StableCombinationWidget from '@/components/chat/StableCombinationWidget';
import ScratchingsWidget from '@/components/chat/ScratchingsWidget';

export default function WidgetsPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Widget Design Review</h1>
          <p className="text-gray-600">
            All 16 chat widgets displayed for design consistency review
          </p>
        </div>

        {/* Widgets Grid */}
        <div className="space-y-8">
          {/* Section 1: Odds Comparison Widget */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">1. Odds Comparison Widget</h2>
              <p className="text-sm text-gray-600">Shows bookmaker odds for a specific horse</p>
            </div>
            <div className="max-w-md">
              <OddsComparisonWidget
                horseName="Thunder Bolt"
                race="Flemington R4 · 1400m"
                bookmakerOdds={[
                  {
                    bookmaker: 'TAB',
                    logo: '/logos/tab.png',
                    odds: 3.5,
                    wasOdds: 3.8,
                    url: 'https://tab.com.au',
                  },
                  {
                    bookmaker: 'Sportsbet',
                    logo: '/logos/sportsbet.jpeg',
                    odds: 3.6,
                    url: 'https://sportsbet.com.au',
                  },
                  {
                    bookmaker: 'Ladbrokes',
                    logo: '/logos/ladbrokes.png',
                    odds: 3.7,
                    wasOdds: 3.5,
                    url: 'https://ladbrokes.com.au',
                  },
                  {
                    bookmaker: 'Bet365',
                    logo: '/logos/bet365.png',
                    odds: 3.8,
                    url: 'https://bet365.com.au',
                  },
                ]}
              />
            </div>
          </section>

          {/* Section 2: Form Guide Card */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">2. Form Guide Card</h2>
              <p className="text-sm text-gray-600">
                Displays detailed form and statistics for a horse
              </p>
            </div>
            <div className="max-w-md">
              <FormGuideCard
                horseName="Thunder Bolt"
                age={5}
                sex="Gelding"
                trainer="C. Waller"
                jockey="J. McDonald"
                weight="58.5kg"
                barrier={4}
                careerStats={{
                  starts: 18,
                  wins: 6,
                  places: 4,
                  prize: '$425k',
                }}
                recentForm={[
                  {
                    date: '12 Jan',
                    track: 'Randwick',
                    distance: '1400m',
                    position: 1,
                    totalRunners: 12,
                    trackCondition: 'Good 4',
                    time: '1:22.45',
                  },
                  {
                    date: '28 Dec',
                    track: 'Flemington',
                    distance: '1400m',
                    position: 2,
                    totalRunners: 14,
                    trackCondition: 'Soft 5',
                    time: '1:23.12',
                  },
                  {
                    date: '15 Dec',
                    track: 'Caulfield',
                    distance: '1600m',
                    position: 1,
                    totalRunners: 10,
                    trackCondition: 'Good 3',
                    time: '1:34.67',
                  },
                  {
                    date: '1 Dec',
                    track: 'Moonee Valley',
                    distance: '1400m',
                    position: 5,
                    totalRunners: 12,
                    trackCondition: 'Good 4',
                    time: '1:23.89',
                  },
                  {
                    date: '18 Nov',
                    track: 'Flemington',
                    distance: '1200m',
                    position: 3,
                    totalRunners: 16,
                    trackCondition: 'Firm 2',
                    time: '1:09.23',
                  },
                ]}
                trackRecord={{
                  starts: 4,
                  wins: 2,
                  places: 1,
                }}
                distanceRecord={{
                  starts: 8,
                  wins: 4,
                  places: 2,
                }}
              />
            </div>
          </section>

          {/* Section 3: Horse Comparison */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">3. Horse Comparison Widget</h2>
              <p className="text-sm text-gray-600">Side-by-side comparison of multiple horses</p>
            </div>
            <HorseComparison
              race="Flemington R4 · 1400m · Good 4"
              horses={[
                {
                  name: 'Thunder Bolt',
                  number: 4,
                  barrier: 4,
                  jockey: 'J. McDonald',
                  trainer: 'C. Waller',
                  weight: '58.5kg',
                  age: 5,
                  sex: 'G',
                  currentOdds: 3.5,
                  wasOdds: 3.8,
                  bestOddsBookmaker: {
                    name: 'TAB',
                    logo: '/logos/tab.png',
                    url: 'https://tab.com.au',
                  },
                  lastFive: '1-2-1-5-3',
                  careerRecord: {
                    starts: 18,
                    wins: 6,
                    places: 4,
                    winPct: 33,
                  },
                  trackRecord: {
                    starts: 4,
                    wins: 2,
                    places: 1,
                    winPct: 50,
                  },
                  distanceRecord: {
                    starts: 8,
                    wins: 4,
                    places: 2,
                    winPct: 50,
                  },
                  prizeMoney: 425000,
                  speedRating: 98,
                  lastStart: {
                    position: 1,
                    margin: 'Won by 1.2L',
                    track: 'Randwick',
                    distance: 1400,
                  },
                },
                {
                  name: 'Lightning Strike',
                  number: 7,
                  barrier: 2,
                  jockey: 'R. King',
                  trainer: 'G. Waterhouse',
                  weight: '57kg',
                  age: 4,
                  sex: 'M',
                  currentOdds: 4.2,
                  wasOdds: 5.2,
                  bestOddsBookmaker: {
                    name: 'Sportsbet',
                    logo: '/logos/sportsbet.jpeg',
                    url: 'https://sportsbet.com.au',
                  },
                  lastFive: '2-1-3-1-2',
                  careerRecord: {
                    starts: 15,
                    wins: 5,
                    places: 7,
                    winPct: 33,
                  },
                  trackRecord: {
                    starts: 3,
                    wins: 1,
                    places: 2,
                    winPct: 33,
                  },
                  distanceRecord: {
                    starts: 6,
                    wins: 3,
                    places: 2,
                    winPct: 50,
                  },
                  prizeMoney: 380000,
                  speedRating: 96,
                  lastStart: {
                    position: 2,
                    margin: '0.5L',
                    track: 'Flemington',
                    distance: 1400,
                  },
                },
                {
                  name: 'Storm Warning',
                  number: 12,
                  barrier: 8,
                  jockey: 'D. Lane',
                  trainer: 'M. Freedman',
                  weight: '56kg',
                  age: 6,
                  sex: 'G',
                  currentOdds: 5.5,
                  wasOdds: 4.8,
                  bestOddsBookmaker: {
                    name: 'Ladbrokes',
                    logo: '/logos/ladbrokes.png',
                    url: 'https://ladbrokes.com.au',
                  },
                  lastFive: '3-4-2-1-6',
                  careerRecord: {
                    starts: 22,
                    wins: 5,
                    places: 8,
                    winPct: 23,
                  },
                  trackRecord: {
                    starts: 5,
                    wins: 1,
                    places: 2,
                    winPct: 20,
                  },
                  distanceRecord: {
                    starts: 9,
                    wins: 2,
                    places: 4,
                    winPct: 22,
                  },
                  prizeMoney: 310000,
                  speedRating: 94,
                  lastStart: {
                    position: 3,
                    margin: '1.8L',
                    track: 'Caulfield',
                    distance: 1400,
                  },
                },
              ]}
            />
          </section>

          {/* Section 4: Track Conditions Widget */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">4. Track Conditions Widget</h2>
              <p className="text-sm text-gray-600">Weather and track information</p>
            </div>
            <div className="max-w-md">
              <TrackConditionsWidget
                track="Flemington"
                raceNumber={4}
                trackRating="Good 4"
                weather="Partly Cloudy"
                temperature={22}
                windSpeed={15}
                windDirection="NW"
                railPosition="True"
                lastUpdated="30 minutes ago"
              />
            </div>
          </section>

          {/* Section 5: Jockey Stats Widget */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">5. Jockey/Trainer Stats Widget</h2>
              <p className="text-sm text-gray-600">
                Performance statistics for jockeys and trainers
              </p>
            </div>
            <div className="max-w-md">
              <JockeyStatsWidget
                name="J. McDonald"
                role="jockey"
                todayRides={5}
                season={{
                  rides: 245,
                  wins: 48,
                  places: 67,
                  winRate: 20,
                  strikeRate: 47,
                }}
                track={{
                  rides: 32,
                  wins: 8,
                  places: 11,
                  winRate: 25,
                }}
                recentForm="W-2-1-3-W"
                prizeMoney="$4.2M"
              />
            </div>
          </section>

          {/* Section 6: Race Info Widget */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">6. Race Information Widget</h2>
              <p className="text-sm text-gray-600">Complete race details and specifications</p>
            </div>
            <div className="max-w-md">
              <RaceInfoWidget
                track="Flemington"
                raceNumber={4}
                raceName="Makybe Diva Stakes"
                distance={1600}
                trackCondition="Good 4"
                raceTime="3:45 PM"
                prizeMoney="$500,000"
                raceClass="Group 1"
                ageRestriction="3yo+"
                runners={12}
                nominations={18}
              />
            </div>
          </section>

          {/* Section 7: Race Result Widget */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">7. Race Result Widget</h2>
              <p className="text-sm text-gray-600">Final results with dividends</p>
            </div>
            <div className="max-w-md">
              <RaceResultWidget
                race="R4"
                track="Flemington"
                distance={1400}
                winningTime="1:22.45"
                winners={[
                  {
                    position: 1,
                    horseName: 'Thunder Bolt',
                    horseNumber: 4,
                    jockey: 'J. McDonald',
                    barrier: 4,
                    margin: 'Won by 1.2L',
                    finalOdds: 3.5,
                    bestOddsBookmaker: {
                      name: 'TAB',
                      logo: '/logos/tab.png',
                      url: 'https://tab.com.au',
                    },
                  },
                  {
                    position: 2,
                    horseName: 'Lightning Strike',
                    horseNumber: 7,
                    jockey: 'R. King',
                    barrier: 2,
                    margin: '0.8L',
                    finalOdds: 4.2,
                    bestOddsBookmaker: {
                      name: 'Sportsbet',
                      logo: '/logos/sportsbet.png',
                      url: 'https://sportsbet.com.au',
                    },
                  },
                  {
                    position: 3,
                    horseName: 'Storm Warning',
                    horseNumber: 12,
                    jockey: 'D. Lane',
                    barrier: 8,
                    margin: '1.5L',
                    finalOdds: 5.5,
                    bestOddsBookmaker: {
                      name: 'Ladbrokes',
                      logo: '/logos/ladbrokes.png',
                      url: 'https://ladbrokes.com.au',
                    },
                  },
                  {
                    position: 4,
                    horseName: 'Golden Arrow',
                    horseNumber: 3,
                    jockey: 'B. Shinn',
                    barrier: 6,
                    margin: '2.1L',
                    finalOdds: 8.0,
                    bestOddsBookmaker: {
                      name: 'Bet365',
                      logo: '/logos/bet365.png',
                      url: 'https://bet365.com.au',
                    },
                  },
                ]}
                dividends={{
                  win: 3.5,
                  place: [1.8, 2.1, 2.4],
                  quinella: 12.4,
                  exacta: 18.6,
                  trifecta: 142.3,
                }}
              />
            </div>
          </section>

          {/* Section 8: Head to Head Widget */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">8. Head to Head Widget</h2>
              <p className="text-sm text-gray-600">Direct comparison between two horses</p>
            </div>
            <div className="max-w-md">
              <HeadToHeadWidget
                race="Flemington R4 · 1400m"
                horse1={{
                  name: 'Thunder Bolt',
                  number: 4,
                  jockey: 'J. McDonald',
                  trainer: 'C. Waller',
                  currentOdds: 3.5,
                  wasOdds: 3.8,
                  bestOddsBookmaker: {
                    name: 'TAB',
                    logo: '/logos/tab.png',
                    url: 'https://tab.com.au',
                  },
                  form: '1-2-1',
                  careerWins: 6,
                  careerStarts: 18,
                  trackWins: 2,
                  trackStarts: 4,
                  speedRating: 98,
                  weight: '58.5kg',
                  barrier: 4,
                }}
                horse2={{
                  name: 'Lightning Strike',
                  number: 7,
                  jockey: 'R. King',
                  trainer: 'G. Waterhouse',
                  currentOdds: 4.2,
                  wasOdds: 5.2,
                  bestOddsBookmaker: {
                    name: 'Sportsbet',
                    logo: '/logos/sportsbet.png',
                    url: 'https://sportsbet.com.au',
                  },
                  form: '2-1-3',
                  careerWins: 5,
                  careerStarts: 15,
                  trackWins: 1,
                  trackStarts: 3,
                  speedRating: 96,
                  weight: '57kg',
                  barrier: 2,
                }}
                previousMeetings={{
                  total: 3,
                  horse1Wins: 2,
                  horse2Wins: 1,
                }}
              />
            </div>
          </section>

          {/* Section 9: Bookmaker Comparison Widget */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">9. Bookmaker Comparison Widget</h2>
              <p className="text-sm text-gray-600">Compare bookmakers, features, and bonuses</p>
            </div>
            <div className="max-w-md">
              <BookmakerComparisonWidget
                bookmakers={[
                  {
                    name: 'TAB',
                    logo: '/logos/tab.png',
                    rating: 4.5,
                    signUpBonus: 'Bet $50, Get $50 in Bonus Bets',
                    features: ['Best Tote Odds', 'Live Streaming', 'Cash Out'],
                    pros: [
                      'Excellent customer service and support',
                      'Comprehensive racing coverage across Australia',
                      'Trusted brand with 50+ years experience',
                    ],
                    url: 'https://tab.com.au',
                  },
                  {
                    name: 'Sportsbet',
                    logo: '/logos/sportsbet.jpeg',
                    rating: 4.3,
                    signUpBonus: 'Bet $20, Get $20 Free',
                    features: ['Same Race Multi', 'Price Boosts', 'Mobile App'],
                    pros: [
                      'User-friendly mobile app with great UX',
                      'Regular promotions and price boosts',
                      'Fast withdrawals and deposits',
                    ],
                    url: 'https://sportsbet.com.au',
                  },
                ]}
              />
            </div>
          </section>

          {/* Section 10: Market Movers Widget */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">10. Market Movers Widget</h2>
              <p className="text-sm text-gray-600">Live odds movements - steamers and drifters</p>
            </div>
            <div className="max-w-md">
              <MarketMoversWidget
                race="Flemington R4 · 1400m"
                steamers={[
                  {
                    horseName: 'Thunder Bolt',
                    horseNumber: 4,
                    currentOdds: 3.5,
                    openingOdds: 5.0,
                    percentageChange: -30,
                    volume: 'high',
                    bestOddsBookmaker: {
                      name: 'TAB',
                      logo: '/logos/tab.png',
                      url: 'https://tab.com.au',
                    },
                  },
                  {
                    horseName: 'Lightning Strike',
                    horseNumber: 7,
                    currentOdds: 4.2,
                    openingOdds: 5.5,
                    percentageChange: -24,
                    volume: 'medium',
                    bestOddsBookmaker: {
                      name: 'Sportsbet',
                      logo: '/logos/sportsbet.png',
                      url: 'https://sportsbet.com.au',
                    },
                  },
                ]}
                drifters={[
                  {
                    horseName: 'Storm Warning',
                    horseNumber: 12,
                    currentOdds: 8.5,
                    openingOdds: 6.0,
                    percentageChange: 42,
                    volume: 'medium',
                    bestOddsBookmaker: {
                      name: 'Bet365',
                      logo: '/logos/bet365.png',
                      url: 'https://bet365.com.au',
                    },
                  },
                ]}
                lastUpdated="2 minutes ago"
              />
            </div>
          </section>

          {/* Section 11: Speed Map Widget */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">11. Speed Map Widget</h2>
              <p className="text-sm text-gray-600">Expected race positions and pace analysis</p>
            </div>
            <div className="max-w-md">
              <SpeedMapWidget
                race="Flemington R4 · 1400m"
                distance={1400}
                horses={[
                  {
                    horseName: 'Speed Demon',
                    horseNumber: 1,
                    barrier: 1,
                    runningStyle: 'Leader',
                    earlySpeed: 9,
                  },
                  {
                    horseName: 'Fast Forward',
                    horseNumber: 3,
                    barrier: 3,
                    runningStyle: 'Leader',
                    earlySpeed: 8,
                  },
                  {
                    horseName: 'Thunder Bolt',
                    horseNumber: 4,
                    barrier: 4,
                    runningStyle: 'On Pace',
                    earlySpeed: 7,
                  },
                  {
                    horseName: 'Lightning Strike',
                    horseNumber: 7,
                    barrier: 2,
                    runningStyle: 'Midfield',
                    earlySpeed: 5,
                  },
                  {
                    horseName: 'Storm Warning',
                    horseNumber: 12,
                    barrier: 8,
                    runningStyle: 'Back',
                    earlySpeed: 3,
                  },
                ]}
              />
            </div>
          </section>

          {/* Section 12: Gear Changes Widget */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">12. Gear Changes Widget</h2>
              <p className="text-sm text-gray-600">Equipment changes and their impact</p>
            </div>
            <div className="max-w-md">
              <GearChangesWidget
                race="Flemington R4 · 1400m"
                changes={[
                  {
                    horseName: 'Thunder Bolt',
                    horseNumber: 4,
                    change: 'Blinkers ON',
                    changeType: 'on',
                    previousPerformance: {
                      withGear: { starts: 8, wins: 4, places: 2 },
                      withoutGear: { starts: 10, wins: 2, places: 2 },
                    },
                    impact: 'positive',
                  },
                  {
                    horseName: 'Storm Warning',
                    horseNumber: 12,
                    change: 'Tongue Tie OFF',
                    changeType: 'off',
                    previousPerformance: {
                      withGear: { starts: 6, wins: 1, places: 1 },
                      withoutGear: { starts: 16, wins: 4, places: 7 },
                    },
                    impact: 'negative',
                  },
                ]}
              />
            </div>
          </section>

          {/* Section 13: Barrier Stats Widget */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">13. Barrier Statistics Widget</h2>
              <p className="text-sm text-gray-600">
                Win rates by barrier draw at this track/distance
              </p>
            </div>
            <div className="max-w-md">
              <BarrierStatsWidget
                track="Flemington"
                distance={1400}
                sampleSize={50}
                barrierStats={[
                  { barrier: 1, wins: 8, places: 15, starts: 50, winRate: 16.0, placeRate: 30.0 },
                  { barrier: 2, wins: 10, places: 18, starts: 50, winRate: 20.0, placeRate: 36.0 },
                  { barrier: 3, wins: 9, places: 16, starts: 50, winRate: 18.0, placeRate: 32.0 },
                  { barrier: 4, wins: 12, places: 20, starts: 50, winRate: 24.0, placeRate: 40.0 },
                  { barrier: 5, wins: 7, places: 14, starts: 50, winRate: 14.0, placeRate: 28.0 },
                  { barrier: 6, wins: 4, places: 10, starts: 50, winRate: 8.0, placeRate: 20.0 },
                  { barrier: 7, wins: 3, places: 8, starts: 50, winRate: 6.0, placeRate: 16.0 },
                  { barrier: 8, wins: 2, places: 6, starts: 50, winRate: 4.0, placeRate: 12.0 },
                ]}
                bestBarriers={[4, 2, 3]}
                worstBarriers={[8, 7]}
              />
            </div>
          </section>

          {/* Section 14: Track Bias Widget */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">14. Track Bias Widget</h2>
              <p className="text-sm text-gray-600">Current track conditions and running patterns</p>
            </div>
            <div className="max-w-md">
              <TrackBiasWidget
                track="Flemington"
                date="Today"
                railPosition="True Position"
                weatherCondition="Fine"
                trackRating="Good 4"
                biases={[
                  {
                    category: 'Inside Barriers (1-4)',
                    bias: 'favorable',
                    description:
                      'Inside barriers have won 70% of races today. Rail in true position favors those drawn low.',
                  },
                  {
                    category: 'Leaders',
                    bias: 'neutral',
                    description:
                      'Leaders winning at normal rate. Pace pressure varies by race composition.',
                  },
                  {
                    category: 'Outside Barriers (8+)',
                    bias: 'unfavorable',
                    description:
                      'Wide barriers struggling. Only 1 winner from barrier 8+ in 7 races.',
                  },
                ]}
                recommendation="Strong bias toward inside barriers. Horses drawn 1-4 significant advantage. Leaders getting fair opportunities."
              />
            </div>
          </section>

          {/* Section 15: Stable Combination Widget */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                15. Trainer-Jockey Combination Widget
              </h2>
              <p className="text-sm text-gray-600">Partnership statistics and strike rates</p>
            </div>
            <div className="max-w-md">
              <StableCombinationWidget
                race="Flemington R4 · 1400m"
                topCombination={{
                  trainer: 'C. Waller',
                  jockey: 'J. McDonald',
                  stats: '32% strike rate (15-8-47) · +12.5 units profit',
                }}
                combinations={[
                  {
                    trainer: 'C. Waller',
                    jockey: 'J. McDonald',
                    starts: 47,
                    wins: 15,
                    places: 8,
                    winRate: 31.9,
                    placeRate: 48.9,
                    profitLoss: 12.5,
                    form: '1-2-1',
                    recentWins: ['Randwick', 'Rosehill', 'Flemington'],
                  },
                  {
                    trainer: 'G. Waterhouse',
                    jockey: 'R. King',
                    starts: 38,
                    wins: 11,
                    places: 9,
                    winRate: 28.9,
                    placeRate: 52.6,
                    profitLoss: 8.3,
                    form: '2-1-3',
                    recentWins: ['Flemington', 'Caulfield'],
                  },
                ]}
              />
            </div>
          </section>

          {/* Section 16: Scratchings/Late Changes Widget */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">16. Late Changes Widget</h2>
              <p className="text-sm text-gray-600">Scratchings, rider changes, and late updates</p>
            </div>
            <div className="max-w-md">
              <ScratchingsWidget
                race="Flemington R4 · 1400m"
                lastUpdated="5 minutes ago"
                scratchings={[
                  {
                    horseName: 'Fast Exit',
                    horseNumber: 9,
                    reason: 'Veterinary advice',
                    timeScratched: '1:30 PM',
                    wasBackedFrom: 6.0,
                    wasBackedTo: 4.5,
                  },
                ]}
                riderChanges={[
                  {
                    horseName: 'Thunder Bolt',
                    horseNumber: 4,
                    previousJockey: 'B. Shinn',
                    newJockey: 'J. McDonald',
                    reason: 'Jockey injured in earlier race',
                    impact: 'positive',
                  },
                ]}
                lateChanges={[
                  {
                    type: 'barrier',
                    horseName: 'Lightning Strike',
                    horseNumber: 7,
                    description: 'Barrier changed from 5 to 2 due to scratching',
                    significance: 'high',
                  },
                ]}
              />
            </div>
          </section>

          {/* Design Notes */}
          <section className="bg-white rounded-lg border border-gray-200 p-6 mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Design Consistency Checklist</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>All widgets use brand-primary gradient header</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Consistent padding: px-3 sm:px-4 py-2 sm:py-3</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Responsive text sizes: text-[10px] sm:text-xs, text-sm sm:text-base</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Border hierarchy: border-gray-200 main, border-gray-100 internal</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Consistent footer style with gray-50 background</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Framer motion animations on all cards</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
