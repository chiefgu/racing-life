/**
 * User Factory for Testing
 * Creates mock user data for unit and integration tests
 */

export interface MockUser {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'ambassador' | 'admin';
  created_at: Date;
  updated_at: Date;
}

export const createMockUser = (overrides?: Partial<MockUser>): MockUser => {
  const defaultUser: MockUser = {
    id: 1,
    email: 'test@example.com',
    password_hash: '$2b$10$abcdefghijklmnopqrstuv',
    first_name: 'Test',
    last_name: 'User',
    role: 'user',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  };

  return { ...defaultUser, ...overrides };
};

export const createMockAmbassador = (overrides?: Partial<MockUser>): MockUser => {
  return createMockUser({
    role: 'ambassador',
    email: 'ambassador@example.com',
    first_name: 'Ambassador',
    last_name: 'User',
    ...overrides,
  });
};

export const createMockAdmin = (overrides?: Partial<MockUser>): MockUser => {
  return createMockUser({
    role: 'admin',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
    ...overrides,
  });
};

export const createMockUsers = (count: number): MockUser[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockUser({
      id: i + 1,
      email: `user${i + 1}@example.com`,
      first_name: `User${i + 1}`,
    })
  );
};
