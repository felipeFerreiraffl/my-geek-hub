# Backend Testing

## Current state

No test files exist yet. The test runner is configured but unused.

## Framework

Node.js's built-in test runner — no Jest/Vitest/Mocha installed.

```bash
npm test   # node --test --env-file=.env **/*.test.ts
```

- Assertions: Node's built-in `node:assert/strict`.
- Mocking: Node's built-in `node:test` `mock` module (nothing installed for
  mocking beyond that).

## Conventions to follow

- **File naming:** `*.test.ts`, co-located with the file under test
  (e.g. `src/api/users/users.service.test.ts`).
- **Test names:** describe behavior, `"should ..."` style.
- **No nested `describe` blocks** — `node:test` is flat; group related tests by
  putting them in the same file instead.

```typescript
import { test } from "node:test";
import assert from "node:assert/strict";

test("should return a user by id", async () => {
  const user = await UserService.findUserById("some-id");
  assert.ok(user);
});
```

## What to prioritize first

Given the current codebase, the highest-value areas to cover first are the ones
with the most surrounding complexity and the least margin for error:

1. Auth flow — login, register, refresh (`src/api/auth/`).
2. Authorization middleware (`src/middlewares/auth.middleware.ts`).
3. JWT helpers (`src/libs/jwt.ts`).
4. Bookmark and rating CRUD, including the cascade-delete relationships described
   in [database.md](database.md).
5. Validation middleware (`src/middlewares/validation.middleware.ts`).

## What to mock vs. not

- **Mock:** the database (or point at a disposable test database/schema), the
  logger, and anything reaching an external API once Jikan/RAWG integration exists.
- **Don't mock:** the business logic under test, or standard library behavior.

## Database tests

Point `DATABASE_URL` at a disposable database (e.g. via `.env.test`) rather than
mocking Drizzle directly — the schema's constraints (unique indexes, `CHECK`,
cascades) are part of the behavior worth testing.
