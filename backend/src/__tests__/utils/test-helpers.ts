/**
 * Test Helper Utilities
 * Common utilities for testing across the application
 */

import { Request, Response } from 'express';

/**
 * Creates a mock Express Request object
 */
export const mockRequest = (overrides?: Partial<Request>): Partial<Request> => {
  return {
    params: {},
    query: {},
    body: {},
    headers: {},
    get: jest.fn((header: string) => {
      const headers = overrides?.headers || {};
      return headers[header.toLowerCase()];
    }),
    ...overrides,
  };
};

/**
 * Creates a mock Express Response object
 */
export const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  };
  return res;
};

/**
 * Creates a mock Next function for Express middleware
 */
export const mockNext = (): jest.Mock => {
  return jest.fn();
};

/**
 * Waits for a specified number of milliseconds
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Creates a mock database query result
 */
export const mockQueryResult = <T>(data: T[], rowCount?: number) => {
  return {
    rows: data,
    rowCount: rowCount ?? data.length,
    command: 'SELECT',
    oid: 0,
    fields: [],
  };
};

/**
 * Creates a mock JWT token
 */
export const createMockToken = (userId: number, role: string = 'user'): string => {
  // This is a mock token - in real tests you might use jsonwebtoken
  return `mock.jwt.token.${userId}.${role}`;
};

/**
 * Cleans up test database records
 */
export const cleanupDatabase = async (tables: string[]): Promise<void> => {
  // In a real implementation, this would clean up test database tables
  // For now, it's a placeholder
  console.log(`Would clean up tables: ${tables.join(', ')}`);
};

/**
 * Creates a date in the past
 */
export const pastDate = (daysAgo: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

/**
 * Creates a date in the future
 */
export const futureDate = (daysFromNow: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

/**
 * Mocks environment variables
 */
export const mockEnv = (vars: Record<string, string>): void => {
  Object.keys(vars).forEach(key => {
    process.env[key] = vars[key];
  });
};

/**
 * Restores environment variables
 */
export const restoreEnv = (vars: string[]): void => {
  vars.forEach(key => {
    delete process.env[key];
  });
};
