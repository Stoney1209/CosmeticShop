---
name: backend-testing
description: Write comprehensive backend tests including unit tests, integration tests, and API tests. Use when testing REST APIs, database operations, authentication flows, or business logic. Handles Jest, Pytest, Mocha, testing strategies, mocking, and test coverage.
metadata:
  tags: testing, backend, unit-test, integration-test, API-test, Jest, Pytest, TDD
  platforms: Claude, ChatGPT, Gemini
---


# Backend Testing

## When to use this skill

Specific situations that should trigger this skill:

- **New feature development**: Write tests first using TDD (Test-Driven Development)
- **Adding API endpoints**: Test success and failure cases for REST APIs
- **Bug fixes**: Add tests to prevent regressions
- **Before refactoring**: Write tests that guarantee existing behavior
- **CI/CD setup**: Build automated test pipelines

## Input Format

Format and required/optional information to collect from the user:

### Required information
- **Framework**: Express, Next.js API Routes, NestJS, etc.
- **Test tool**: Jest, Vitest, etc.
- **Test target**: API endpoints, business logic, DB operations, etc.

### Optional information
- **Database**: PostgreSQL (default: separate test DB)
- **Mocking library**: jest.mock, vitest.mock (default: framework built-in)
- **Coverage target**: 80%, 90%, etc. (default: 80%)

### Input example

```
Test the user authentication endpoints for Next.js API:
- Framework: Next.js App Router + Server Actions
- Test tool: Jest + Vitest
- Target: register, login actions
- DB: PostgreSQL (separate test DB)
- Coverage: 85% or above
```

## Instructions

Step-by-step task order to follow precisely.

### Step 1: Set up the test environment

Install and configure the test framework and tools.

**Tasks**:
- Install test dependencies (jest, vitest, @testing-library/react, etc.)
- Configure test database (separate DB or in-memory)
- Create environment variables (.env.test)
- Configure jest.config.js or vitest.config.ts

**Example** (Next.js + Jest):
```bash
npm install --save-dev jest @types/jest @testing-library/react jest-environment-jsdom
```

**jest.config.js**:
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
```

### Step 2: Write Unit Tests (business logic)

Write unit tests for individual functions and classes.

**Tasks**:
- Test pure functions (no dependencies)
- Isolate dependencies via mocking
- Test edge cases (boundary values, exceptions)
- AAA pattern (Arrange-Act-Assert)

**Decision criteria**:
- No external dependencies (DB, API) -> pure Unit Test
- External dependencies present -> use Mock/Stub
- Complex logic -> test various input cases

**Example** (validation utility):
```typescript
// src/lib/validations.ts
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain number');
  }

  return { valid: errors.length === 0, errors };
}

// src/lib/__tests__/validations.test.ts
import { validateEmail, validatePassword } from '../validations';

describe('validateEmail', () => {
  it('should accept valid email', () => {
    const result = validateEmail('test@example.com');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject empty email', () => {
    const result = validateEmail('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Email is required');
  });

  it('should reject invalid format', () => {
    const result = validateEmail('invalid-email');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid email format');
  });
});

describe('validatePassword', () => {
  it('should accept valid password', () => {
    const result = validatePassword('Password123');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject password shorter than 8 characters', () => {
    const result = validatePassword('Pass1!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters');
  });

  it('should reject password without uppercase', () => {
    const result = validatePassword('password123');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain uppercase letter');
  });

  it('should reject password without number', () => {
    const result = validatePassword('Password');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain number');
  });

  it('should return multiple errors for invalid password', () => {
    const result = validatePassword('pass');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});
```

### Step 3: Integration Test (Server Actions / API)

Write integration tests for API endpoints or Server Actions.

**Tasks**:
- Test HTTP requests/responses (Next.js API routes)
- Test Server Actions inputs/outputs
- Success cases (200, 201)
- Failure cases (400, 401, 404, 500)
- Authentication/authorization tests
- Input validation tests

**Checklist**:
- [x] Verify response status code
- [x] Validate response body structure
- [x] Confirm database state changes
- [x] Validate error messages

**Example** (Next.js Server Actions):
```typescript
// src/app/actions/auth.ts
'use server';

import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function register(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: 'User already exists' };
  }

  const hashedPassword = await hashPassword(password);
  
  await db.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  });

  redirect('/dashboard');
}

// src/app/actions/__tests__/auth.test.ts
import { register } from '../auth';
import { db } from '@/lib/db';

jest.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-password'),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create new user successfully', async () => {
    (db.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
    (db.user.create as jest.Mock).mockResolvedValueOnce({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    });

    const formData = new FormData();
    formData.set('email', 'test@example.com');
    formData.set('password', 'Password123');
    formData.set('name', 'Test User');

    await register(formData);

    expect(db.user.create).toHaveBeenCalledWith({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed-password',
      },
    });
  });

  it('should reject duplicate email', async () => {
    (db.user.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '1',
      email: 'test@example.com',
    });

    const formData = new FormData();
    formData.set('email', 'test@example.com');
    formData.set('password', 'Password123');
    formData.set('name', 'Test User');

    const result = await register(formData);

    expect(result).toEqual({ error: 'User already exists' });
    expect(db.user.create).not.toHaveBeenCalled();
  });
});
```

### Step 4: Test Database Setup

Configure test database properly.

**Tasks**:
- Separate test database
- Use transactions for test isolation
- Clean up after each test

**Example**:
```typescript
// src/lib/__tests__/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Test setup - use beforeEach in tests
export async function setupTestDb() {
  await prisma.$transaction([
    prisma.order.deleteMany(),
    prisma.product.deleteMany(),
    prisma.customer.deleteMany(),
  ]);
}

// Clean up - use afterEach in tests
export async function cleanupTestDb() {
  await prisma.$transaction([
    prisma.order.deleteMany(),
    prisma.product.deleteMany(),
    prisma.customer.deleteMany(),
  ]);
}
```

### Step 5: Authentication Tests

Test authentication flows with proper mocking.

**Example**:
```typescript
// src/lib/__tests__/auth-helpers.ts
import { cookies } from 'next/headers';

export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session');

  if (!sessionToken) {
    return null;
  }

  // Validate session token
  const session = await db.session.findUnique({
    where: { token: sessionToken.value },
    include: { user: true },
  });

  return session;
}

// Mock in tests
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

describe('getSession', () => {
  it('should return session for valid token', async () => {
    const mockSession = {
      id: '1',
      token: 'valid-token',
      user: { id: '1', email: 'test@example.com' },
    };

    (cookies as jest.Mock).mockResolvedValue({
      get: () => ({ value: 'valid-token' }),
    });
    (db.session.findUnique as jest.Mock).mockResolvedValueOnce(mockSession);

    const result = await getSession();

    expect(result).toEqual(mockSession);
  });

  it('should return null for no token', async () => {
    (cookies as jest.Mock).mockResolvedValue({
      get: () => null,
    });

    const result = await getSession();

    expect(result).toBeNull();
  });
});
```

## Output format

### Basic structure for Next.js project

```
project/
├── src/
│   ├── lib/
│   │   ├── __tests__/
│   │   │   ├── validations.test.ts
│   │   │   ├── auth-helpers.test.ts
│   │   │   └── db.ts
│   │   └── ...
│   ├── app/
│   │   ├── actions/
│   │   │   ├── __tests__/
│   │   │   │   ├── auth.test.ts
│   │   │   │   └── products.test.ts
│   │   │   └── auth.ts
│   │   └── ...
├── jest.config.js
├── jest.setup.js
└── package.json
```

### Test run scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

## Constraints

### Required rules (MUST)

1. **Test isolation**: Each test must be runnable independently
   - Reset state with beforeEach/afterEach
   - Do not depend on test execution order

2. **Clear test names**: The name must convey what the test verifies
   - ✅ 'should reject duplicate email'
   - ❌ 'test1'

3. **AAA pattern**: Arrange (setup) - Act (execute) - Assert (verify) structure
   - Improves readability
   - Clarifies test intent

### Prohibited (MUST NOT)

1. **No production DB**: Tests must use a separate test database
   - Use .env.test for test connection
   - Clean up data after tests

2. **No real external API calls**: Mock all external services
   - Remove network dependency
   - Speed up tests to reduce costs

3. **No Sleep/Timeout abuse**: Use fake timers for time-based tests
   - jest.useFakeTimers()
   - Prevent test slowdowns

### Security rules

- **No hardcoded secrets**: Never hardcode API keys or passwords in test code
- **Separate environment variables**: Use .env.test file

## Best Practices

### TDD (Test-Driven Development)

1. Write tests before writing code
2. Run tests to see them fail
3. Implement minimum code to pass
4. Refactor while keeping tests green

### Given-When-Then pattern

```typescript
it('should return 404 when product not found', async () => {
  // Given: a non-existent product ID
  const nonExistentId = 'non-existent-uuid';

  // When: attempting to look up that product
  const response = await fetch(`/api/products/${nonExistentId}`);

  // Then: 404 response
  expect(response.status).toBe(404);
});
```

### Test Fixtures

```typescript
const validCustomer = {
  email: 'test@example.com',
  name: 'Test User',
  password: 'Password123!';
};
```

## Common Issues

### Issue 1: Test failures caused by shared state between tests

**Symptom**: Passes individually but fails when run together

**Cause**: DB state shared due to missing cleanup

**Fix**:
```typescript
beforeEach(async () => {
  await cleanupTestDb();
});
```

### Issue 2: "Jest did not exit one second after the test run"

**Symptom**: Process does not exit after tests complete

**Cause**: DB connections, servers, etc. not cleaned up

**Fix**:
```typescript
afterAll(async () => {
  await prisma.$disconnect();
});
```

### Issue 3: Async test timeout

**Symptom**: "Timeout - Async callback was not invoked"

**Cause**: Missing async/await or unhandled Promise

**Fix**:
```typescript
// Bad
it('should work', () => {
  someAsyncFunction();  // Promise not handled
});

// Good
it('should work', async () => {
  await someAsyncFunction();
});
```

## References

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing/jest)
- [Testing Library](https://testing-library.com/)

## Tags
`#testing` `#backend` `#Jest` `#Vitest` `#unit-test` `#integration-test` `#TDD` `#Next.js`