/**
 * Bookmaker Configuration and Mappings
 */

export interface BookmakerInfo {
  key: string;
  name: string;
  displayName: string;
  logoUrl?: string;
  affiliateBaseUrl?: string;
  market: string;
  features: string[];
  rating?: number;
}

/**
 * Australian Bookmaker Configurations
 */
export const AUSTRALIAN_BOOKMAKERS: Record<string, BookmakerInfo> = {
  tab: {
    key: 'tab',
    name: 'TAB',
    displayName: 'TAB',
    market: 'AU',
    features: ['live_streaming', 'cash_out', 'best_tote'],
    rating: 4.5,
  },
  sportsbet: {
    key: 'sportsbet',
    name: 'Sportsbet',
    displayName: 'Sportsbet',
    market: 'AU',
    features: ['live_streaming', 'cash_out', 'same_race_multi'],
    rating: 4.3,
  },
  ladbrokes_au: {
    key: 'ladbrokes_au',
    name: 'Ladbrokes',
    displayName: 'Ladbrokes',
    market: 'AU',
    features: ['cash_out', 'best_of_3'],
    rating: 4.2,
  },
  neds: {
    key: 'neds',
    name: 'Neds',
    displayName: 'Neds',
    market: 'AU',
    features: ['cash_out', 'bonus_bets'],
    rating: 4.1,
  },
  unibet: {
    key: 'unibet',
    name: 'Unibet',
    displayName: 'Unibet',
    market: 'AU',
    features: ['live_streaming', 'cash_out'],
    rating: 4.0,
  },
  betfair_ex_au: {
    key: 'betfair_ex_au',
    name: 'Betfair Exchange',
    displayName: 'Betfair Exchange',
    market: 'AU',
    features: ['exchange', 'cash_out', 'best_odds'],
    rating: 4.4,
  },
  bluebet: {
    key: 'bluebet',
    name: 'BlueBet',
    displayName: 'BlueBet',
    market: 'AU',
    features: ['cash_out', 'bonus_bets'],
    rating: 3.9,
  },
  pointsbetau: {
    key: 'pointsbetau',
    name: 'PointsBet',
    displayName: 'PointsBet',
    market: 'AU',
    features: ['points_betting', 'cash_out'],
    rating: 4.0,
  },
  betr_au: {
    key: 'betr_au',
    name: 'Betr',
    displayName: 'Betr',
    market: 'AU',
    features: ['micro_betting', 'bonus_bets'],
    rating: 3.8,
  },
};

/**
 * Get bookmaker info by key
 */
export function getBookmakerInfo(key: string): BookmakerInfo | undefined {
  return AUSTRALIAN_BOOKMAKERS[key];
}

/**
 * Get all Australian bookmaker keys
 */
export function getAustralianBookmakerKeys(): string[] {
  return Object.keys(AUSTRALIAN_BOOKMAKERS);
}

/**
 * Get bookmaker display name
 */
export function getBookmakerDisplayName(key: string): string {
  const info = getBookmakerInfo(key);
  return info?.displayName || key;
}

/**
 * Check if bookmaker is Australian
 */
export function isAustralianBookmaker(key: string): boolean {
  return key in AUSTRALIAN_BOOKMAKERS;
}

/**
 * Map The Odds API bookmaker key to our database bookmaker
 */
export function mapOddsApiBookmaker(oddsApiKey: string): string {
  // The Odds API keys match our keys, but we can add mappings here if needed
  return oddsApiKey;
}

/**
 * Feature descriptions
 */
export const BOOKMAKER_FEATURES: Record<string, string> = {
  live_streaming: 'Live race streaming',
  cash_out: 'Cash out before race ends',
  best_tote: 'Best Tote + SP guarantee',
  same_race_multi: 'Same race multi bets',
  best_of_3: 'Best of 3 totes',
  bonus_bets: 'Bonus bet promotions',
  exchange: 'Betting exchange',
  best_odds: 'Best odds guaranteed',
  points_betting: 'Points betting',
  micro_betting: 'Micro betting markets',
};

/**
 * Get feature description
 */
export function getFeatureDescription(feature: string): string {
  return BOOKMAKER_FEATURES[feature] || feature;
}
