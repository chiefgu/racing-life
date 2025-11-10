/**
 * Race Factory for Testing
 * Creates mock race data for unit and integration tests
 */

export interface MockRace {
  id: number;
  name: string;
  venue: string;
  race_time: Date;
  race_type: string;
  distance: number;
  class: string;
  prize_money: number;
  going: string;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface MockRunner {
  id: number;
  race_id: number;
  horse_name: string;
  jockey: string;
  trainer: string;
  age: number;
  weight: number;
  draw: number;
  form: string;
  rating: number;
  created_at: Date;
  updated_at: Date;
}

export const createMockRace = (overrides?: Partial<MockRace>): MockRace => {
  const defaultRace: MockRace = {
    id: 1,
    name: 'Test Race',
    venue: 'Flemington',
    race_time: new Date('2024-12-25T14:30:00Z'),
    race_type: 'Thoroughbred',
    distance: 1600,
    class: 'Group 1',
    prize_money: 500000,
    going: 'Good',
    status: 'upcoming',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  };

  return { ...defaultRace, ...overrides };
};

export const createMockRunner = (overrides?: Partial<MockRunner>): MockRunner => {
  const defaultRunner: MockRunner = {
    id: 1,
    race_id: 1,
    horse_name: 'Thunder Bolt',
    jockey: 'J. Smith',
    trainer: 'T. Jones',
    age: 4,
    weight: 57.5,
    draw: 5,
    form: '1-2-1-3',
    rating: 105,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  };

  return { ...defaultRunner, ...overrides };
};

export const createMockRaces = (count: number): MockRace[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockRace({
      id: i + 1,
      name: `Race ${i + 1}`,
      race_time: new Date(Date.now() + (i * 3600000)), // Each race 1 hour apart
    })
  );
};

export const createMockRunners = (raceId: number, count: number): MockRunner[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockRunner({
      id: i + 1,
      race_id: raceId,
      horse_name: `Horse ${i + 1}`,
      draw: i + 1,
    })
  );
};
