/**
 * Odds Factory for Testing
 * Creates mock odds data for unit and integration tests
 */

export interface MockOdds {
  id: number;
  runner_id: number;
  bookmaker_id: number;
  win_odds: number;
  place_odds: number | null;
  timestamp: Date;
  created_at: Date;
}

export interface MockBookmaker {
  id: number;
  name: string;
  slug: string;
  logo_url: string;
  affiliate_url: string;
  commission_rate: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export const createMockOdds = (overrides?: Partial<MockOdds>): MockOdds => {
  const defaultOdds: MockOdds = {
    id: 1,
    runner_id: 1,
    bookmaker_id: 1,
    win_odds: 5.5,
    place_odds: 2.1,
    timestamp: new Date(),
    created_at: new Date(),
  };

  return { ...defaultOdds, ...overrides };
};

export const createMockBookmaker = (overrides?: Partial<MockBookmaker>): MockBookmaker => {
  const defaultBookmaker: MockBookmaker = {
    id: 1,
    name: 'Test Bookmaker',
    slug: 'test-bookmaker',
    logo_url: 'https://example.com/logo.png',
    affiliate_url: 'https://example.com/affiliate',
    commission_rate: 0.15,
    is_active: true,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  };

  return { ...defaultBookmaker, ...overrides };
};

export const createMockOddsHistory = (
  runnerId: number,
  bookmakerId: number,
  count: number
): MockOdds[] => {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const timestamp = new Date(now - (count - i) * 60000); // 1 minute intervals
    return createMockOdds({
      id: i + 1,
      runner_id: runnerId,
      bookmaker_id: bookmakerId,
      win_odds: 5.5 + Math.random() * 2 - 1, // Vary odds slightly
      timestamp,
      created_at: timestamp,
    });
  });
};

export const createMockBookmakers = (count: number): MockBookmaker[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockBookmaker({
      id: i + 1,
      name: `Bookmaker ${i + 1}`,
      slug: `bookmaker-${i + 1}`,
    })
  );
};
