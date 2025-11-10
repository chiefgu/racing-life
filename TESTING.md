# Racing Life - Testing Guide

## Table of Contents

- [Overview](#overview)
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [E2E Testing](#e2e-testing)
- [Security Testing](#security-testing)
- [Performance Testing](#performance-testing)
- [CI/CD Integration](#cicd-integration)

## Overview

The Racing Life application uses a comprehensive testing strategy:

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and database operations
- **E2E Tests**: Test complete user workflows
- **Security Tests**: Audit for vulnerabilities
- **Performance Tests**: Load and stress testing

### Test Coverage Goals

- Backend: >80% code coverage
- Frontend: >75% code coverage
- Critical paths: 100% coverage

## Backend Testing

### Setup

The backend uses Jest for unit and integration testing.

```bash
cd backend
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.controller.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="login"
```

### Test Structure

```
backend/src/__tests__/
├── controllers/       # Controller unit tests
├── services/         # Service unit tests
├── middleware/       # Middleware unit tests
├── integration/      # API integration tests
├── factories/        # Test data factories
└── utils/           # Test helper utilities
```

### Writing Unit Tests

#### Controller Test Example

```typescript
import { Request, Response } from 'express';
import { login } from '../../controllers/auth.controller';
import { mockRequest, mockResponse } from '../utils/test-helpers';

describe('Auth Controller', () => {
  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      });
      const res = mockResponse();

      await login(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: expect.objectContaining({
          token: expect.any(String),
        }),
      });
    });
  });
});
```

#### Service Test Example

```typescript
import { OddsService } from '../../services/odds.service';
import { createMockOdds } from '../factories/odds.factory';

describe('OddsService', () => {
  let oddsService: OddsService;

  beforeEach(() => {
    oddsService = new OddsService();
  });

  it('should calculate best odds correctly', () => {
    const odds = [
      createMockOdds({ bookmaker_id: 1, win_odds: 5.5 }),
      createMockOdds({ bookmaker_id: 2, win_odds: 6.0 }),
      createMockOdds({ bookmaker_id: 3, win_odds: 5.8 }),
    ];

    const bestOdds = oddsService.findBestOdds(odds);

    expect(bestOdds.bookmaker_id).toBe(2);
    expect(bestOdds.win_odds).toBe(6.0);
  });
});
```

### Integration Tests

Integration tests verify API endpoints work correctly with database:

```typescript
import request from 'supertest';
import { app } from '../../index';
import { db } from '../../config/database';

describe('Races API', () => {
  beforeAll(async () => {
    await db.migrate.latest();
  });

  afterAll(async () => {
    await db.migrate.rollback();
    await db.destroy();
  });

  describe('GET /api/races', () => {
    it('should return list of races', async () => {
      const response = await request(app).get('/api/races').expect(200);

      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter races by date', async () => {
      const response = await request(app).get('/api/races?date=2024-12-25').expect(200);

      expect(response.body.data.every((race) => race.race_time.startsWith('2024-12-25'))).toBe(
        true
      );
    });
  });
});
```

### Test Data Factories

Use factories to create consistent test data:

```typescript
import { createMockUser, createMockRace, createMockOdds } from '../factories';

const user = createMockUser({ role: 'admin' });
const race = createMockRace({ venue: 'Flemington' });
const odds = createMockOdds({ win_odds: 5.5 });
```

### Mocking Dependencies

```typescript
// Mock database
jest.mock('../../db/knex', () => ({
  db: jest.fn(),
}));

// Mock external API
jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({ data: { odds: [] } }),
}));

// Mock Redis
jest.mock('../../config/redis', () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));
```

## Frontend Testing

### Setup

The frontend uses Jest and React Testing Library.

```bash
cd frontend
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Update snapshots
npm test -- -u
```

### Component Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { RaceCard } from '../components/RaceCard';

describe('RaceCard', () => {
  const mockRace = {
    id: 1,
    name: 'Melbourne Cup',
    venue: 'Flemington',
    race_time: '2024-11-05T14:00:00Z',
  };

  it('renders race information', () => {
    render(<RaceCard race={mockRace} />);

    expect(screen.getByText('Melbourne Cup')).toBeInTheDocument();
    expect(screen.getByText('Flemington')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const onClick = jest.fn();
    render(<RaceCard race={mockRace} onClick={onClick} />);

    fireEvent.click(screen.getByText('Melbourne Cup'));
    expect(onClick).toHaveBeenCalledWith(mockRace);
  });
});
```

### Hook Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useRaceOdds } from '../hooks/useRaceOdds';

describe('useRaceOdds', () => {
  it('fetches and returns odds data', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useRaceOdds(1));

    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.odds).toBeDefined();
  });
});
```

### Snapshot Testing

```typescript
import { render } from '@testing-library/react';
import { OddsTable } from '../components/OddsTable';

it('matches snapshot', () => {
  const { container } = render(<OddsTable odds={mockOdds} />);
  expect(container).toMatchSnapshot();
});
```

## E2E Testing

### Setup Playwright

```bash
cd frontend
npm install -D @playwright/test
npx playwright install
```

### Configuration

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

### Writing E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test('user can login successfully', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('user can view race odds', async ({ page }) => {
    await page.goto('/races/1');

    await expect(page.locator('h1')).toContainText('Race Details');
    await expect(page.locator('.odds-table')).toBeVisible();

    const odds = page.locator('.odds-row');
    await expect(odds).toHaveCount.greaterThan(0);
  });
});
```

### Running E2E Tests

```bash
# Run all E2E tests
npx playwright test

# Run in headed mode
npx playwright test --headed

# Run specific test file
npx playwright test auth.spec.ts

# Debug mode
npx playwright test --debug

# Generate test report
npx playwright show-report
```

## Security Testing

### Running Security Audit

```bash
cd backend
npx tsx src/scripts/security/audit.ts
```

### NPM Audit

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Force fix (may introduce breaking changes)
npm audit fix --force
```

### OWASP Dependency Check

```bash
# Install dependency-check
npm install -g dependency-check

# Run check
dependency-check --project "Racing Life" --scan ./
```

### Security Headers Testing

```bash
# Test security headers
curl -I https://racinglife.com | grep -E "X-Frame-Options|X-Content-Type-Options|Strict-Transport-Security"
```

### Penetration Testing Checklist

- [ ] SQL Injection testing
- [ ] XSS vulnerability testing
- [ ] CSRF token validation
- [ ] Authentication bypass attempts
- [ ] Authorization checks
- [ ] Rate limiting verification
- [ ] API key security
- [ ] Session management
- [ ] Input validation
- [ ] File upload security

## Performance Testing

### Load Testing with k6

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 100, // 100 virtual users
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
  },
};

export default function () {
  let response = http.get('http://localhost:3001/api/races');

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

Run load test:

```bash
k6 run load-test.js
```

### Database Query Performance

```bash
# Enable query logging
ALTER DATABASE racing_life SET log_min_duration_statement = 100;

# Analyze slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Lighthouse Testing

```bash
# Install Lighthouse
npm install -g lighthouse

# Run audit
lighthouse https://racinglife.com --output html --output-path ./report.html
```

## CI/CD Integration

### GitHub Actions

The CI/CD pipeline automatically runs tests on every push and pull request.

#### Pipeline Stages

1. **Linting**: ESLint, TypeScript checks
2. **Unit Tests**: Jest tests with coverage
3. **Integration Tests**: API endpoint tests
4. **Security Audit**: Dependency scanning
5. **Build**: Compile TypeScript, build frontend
6. **E2E Tests**: Playwright tests (on staging)
7. **Deploy**: Deploy to staging/production

#### Coverage Reports

Coverage reports are uploaded to Codecov:

- View at: https://codecov.io/gh/your-org/racing-life

#### Required Checks

All PRs must pass:

- ✅ All tests passing
- ✅ >80% backend coverage
- ✅ >75% frontend coverage
- ✅ No ESLint errors
- ✅ No TypeScript errors
- ✅ Security audit passing

### Pre-commit Hooks

```bash
# Husky runs tests before commit
git commit -m "Add feature"
# → Runs linter, type check, and tests
```

## Test Data Management

### Seeding Test Database

```bash
cd backend
npm run seed:run
```

### Cleaning Test Data

```typescript
// In test files
afterEach(async () => {
  await db('races').delete();
  await db('users').delete();
});
```

### Test Isolation

- Each test should be independent
- Use transactions for database tests
- Clean up after each test
- Don't rely on test execution order

## Best Practices

1. **Write descriptive test names**

   ```typescript
   it('should return 401 when user is not authenticated');
   ```

2. **Follow AAA pattern**

   ```typescript
   // Arrange
   const user = createMockUser();

   // Act
   const result = await authService.login(user);

   // Assert
   expect(result.token).toBeDefined();
   ```

3. **Use factories for test data**

   ```typescript
   const race = createMockRace({ venue: 'Flemington' });
   ```

4. **Mock external dependencies**

   ```typescript
   jest.mock('axios');
   ```

5. **Test edge cases**
   - Empty inputs
   - Invalid data
   - Boundary conditions
   - Error scenarios

6. **Keep tests fast**
   - Mock slow operations
   - Use test database
   - Parallel test execution

## Continuous Improvement

### Monitor Test Metrics

- Test execution time
- Code coverage trends
- Flaky test detection
- Test reliability

### Regular Maintenance

- Update dependencies
- Remove obsolete tests
- Refactor duplicate code
- Add tests for bug fixes

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [k6 Load Testing](https://k6.io/)
