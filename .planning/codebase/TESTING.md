---
last_mapped_commit: de5ea76306acf12143bdc0b9c6e23ed449b8b46b
last_mapped_at: 2026-09-15
---
# Testing Patterns

**Analysis Date:** 2026-09-15

## Test Framework

**Runner:**

- Node.js built-in test runner (`node --test`)
- No external test framework configured (Jest, Vitest not installed)
- Backend: TypeScript via `tsx` transpiler at runtime

**Run Commands:**

```bash
npm run test              # Run all tests matching **/*.test.ts pattern
                          # Command: node --test --env-file=.env **/*.test.ts

npm run dev               # Development server with file watching
npm run build             # Compile TypeScript to JavaScript
```

**Assertion Library:**

- Node.js built-in `assert` module (default with `node --test`)
- No explicit assertion library configured

**Environment:**

- Tests run with `.env` file loaded: `--env-file=.env`
- Access to environment variables: `NODE_ENV`, `PORT`, `DATABASE_URL`, etc.

## Test File Organization

**Naming Convention:**

- Files must end in `.test.ts` to match the glob pattern in package.json
- Pattern: `**/*.test.ts` (any directory, any file)
- Example structure: `src/api/users/users.test.ts`, `src/utils/logger.test.ts`

**Location:**

- Co-located: Test files placed alongside implementation
- Alternative not enforced but could follow: `/tests` directory structure

**Current State:**

- No test files found in codebase (`backend/src/**/*.test.ts` empty)
- Frontend has no test configuration or test files
- All test patterns are undefined — tests need to be created

## Test Structure

**Expected Test Suite Format:**

```typescript
import { test } from "node:test";
import assert from "node:assert/strict";

test("should describe what is being tested", () => {
  // Arrange
  const input = "value";
  
  // Act
  const result = someFunction(input);
  
  // Assert
  assert.strictEqual(result, expected);
});

test("async operations", async () => {
  const result = await asyncFunction();
  assert.ok(result);
});
```

**Suite Organization:**

- Flat test functions (no nested describe blocks — node:test doesn't support this)
- Test names use "should" pattern: `test("should return user by id", ...)`
- Related tests grouped in same file
- One test file per module recommended

## Mocking

**Framework:** None configured

- Node.js built-in mocking via `node:test` mock module would be used if needed
- No mock libraries installed (Sinon, Jest mocks, etc.)

**Patterns for Mocking (when implemented):**

```typescript
import { test, mock } from "node:test";

test("mocks function calls", async (t) => {
  const mockFn = mock.fn();
  // Use mockFn in code being tested
  assert.equal(mockFn.mock.callCount(), 1);
});
```

**What to Mock:**

- External API calls (if any)
- Database queries (use in-memory database or mock db)
- Pino logger calls
- JWT verification for auth tests
- File I/O operations

**What NOT to Mock:**

- Business logic within tested function
- Core TypeScript types
- Standard library functions (unless testing error paths)

## Fixtures and Factories

**Test Data:**

- Not yet implemented in codebase
- Recommended approach: Factory functions in test files or shared test utilities

**Example Pattern (to follow):**

```typescript
// utils/testHelpers.ts
export function createTestUser(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    email: "test@example.com",
    username: "testuser",
    password: "hashedPassword",
    role: "USER" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
```

**Recommended Location:**

- `backend/src/__tests__/helpers/` or `backend/src/__tests__/fixtures/`
- Shared fixtures across test suite
- Type-safe with TypeScript

## Coverage

**Requirements:** Not enforced

- No coverage tool configured (c8, nyc, etc.)
- No coverage thresholds set
- No coverage reporting in package.json scripts

**View Coverage (when implemented):**

```bash

# Would require adding c8 or similar

npm install --save-dev c8
npm run test -- --coverage  # Command would need to be added to package.json
```

## Test Types

**Unit Tests:**

- Scope: Individual functions and modules
- Approach: Test service functions in isolation
  - Example: `users.service.test.ts` — test `findUserById()`, `createUser()`, `deleteUserById()`
- Mock external dependencies: database calls, HTTP requests
- Fast execution (should complete in milliseconds)

**Integration Tests:**

- Scope: Multiple components working together
- Approach: Test controller → service → database flow
  - Example: `users.controller.test.ts` — test full request-response cycle
- May use test database or in-memory fixtures
- Requires proper setup/teardown

**E2E Tests:**

- Status: Not configured
- Would require: Supertest or similar for HTTP testing
- Not implemented in this codebase

## Async Testing

**Patterns:**

```typescript
test("async functions", async () => {
  const user = await UserService.findUserById("123");
  assert.ok(user);
});

test("handles promise rejection", async () => {
  await assert.rejects(
    () => UserService.findUserById("invalid"),
    { name: "Error" }
  );
});
```

**Promise handling:**

- Use `async/await` syntax
- Use `assert.rejects()` for testing errors
- Ensure test function is marked `async`

## Error Testing

**Patterns:**

```typescript
test("middleware handles errors", async () => {
  const mockError = { status: 404 };
  // Pass error to error handler
  await assert.rejects(
    () => errorHandler(mockError, req, res, next),
    { status: 404 }
  );
});

test("validation rejects invalid email", () => {
  const schema = z.email();
  const result = schema.safeParse("invalid");
  assert.ok(!result.success);
});
```

**Validation Testing:**

- Use Zod's `safeParse()` for validation testing
- Assert on `success` field
- Check error messages with `result.error.message`

## Database Testing

**Approach (recommended):**

- Use test database instance with `.env.test`
- Seed with known test data
- Rollback after each test (transactions)
- Or use in-memory SQLite with Drizzle

**Drizzle-specific:**

```typescript
import { db } from "@/config/db";
import { users } from "@/db/drizzle";

test("creates user in database", async () => {
  const newUser = await db.insert(users).values({...}).returning();
  assert.ok(newUser[0].id);
});
```

## Authentication Testing

**JWT Testing:**

```typescript
import { createAccessToken, verifyAccessToken } from "@/libs/jwt";

test("creates valid access token", async () => {
  const token = await createAccessToken("user-123", "USER");
  assert.ok(token);
  
  const payload = await verifyAccessToken(token);
  assert.equal(payload.sub, "user-123");
});

test("rejects expired token", async () => {
  // Mock time or use expired token
  await assert.rejects(
    () => verifyAccessToken(expiredToken),
    { name: "JWTExpired" }
  );
});
```

## Middleware Testing

**Pattern:**

```typescript
test("auth middleware attaches user to request", async () => {
  const req = {
    headers: {
      authorization: "Bearer " + validToken,
    },
  };
  const res = {};
  const next = mock.fn();
  
  await authenticateUser(req, res, next);
  
  assert.ok(req.user);
  assert.equal(req.user.id, "user-123");
});
```

## Setup and Teardown

**Recommended Pattern:**

```typescript
import { test } from "node:test";
import { beforeEach, afterEach } from "node:test";

test("suite with setup/teardown", async (t) => {
  await t.before(async () => {
    // Setup database connection
  });
  
  await t.after(async () => {
    // Cleanup and close connections
  });
  
  test("test within suite", () => {
    // Test code
  });
});
```

## Test Isolation

**Requirements:**

- Each test must be independent
- No shared state between tests
- Use test helpers/factories to create isolated data
- Clean up after each test (database rollback, mock reset)

## Recommended Test Coverage

**Priority (when implementing):**

| Module | Priority | Reason |
|--------|----------|--------|
| `services/*.service.ts` | High | Core business logic |
| `controllers/*.controller.ts` | High | Request handling and validation |
| `middlewares/auth.middleware.ts` | High | Security-critical |
| `libs/jwt.ts` | High | Token handling |
| `utils/logger.ts` | Medium | Logging utility |
| `utils/serverFn.ts` | Medium | Error wrapping |
| `config/dotenv.ts` | Medium | Configuration validation |

---

*Testing analysis: 2026-09-15*
