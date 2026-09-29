---
last_mapped_commit: de5ea76306acf12143bdc0b9c6e23ed449b8b46b
last_mapped_at: 2026-09-15
---
# Codebase Concerns

**Analysis Date:** 2026-09-15

## Critical Issues

### Production Server Non-Functional

**Problem:** The application server never starts listening for HTTP requests in production environments.

**Files:** `backend/src/index.ts` (lines 8-17)

**What's happening:**

```typescript
if (NODE_ENV !== "prod") {
  app.listen(PORT, () => {
    // server starts only in dev/test
  }
};
```

**Impact:** Production deployments will start the Node.js process but not bind to any port, making the API completely unreachable. Application appears to run but handles no requests.

**Fix approach:** Remove the environment check. The server should listen on PORT in all environments, or implement proper graceful shutdown handling for specific deployment patterns if needed.

---

## Authorization & Security Issues

### Authorization Middleware Bypass

**Problem:** The `authorize` middleware always grants access due to a logical error in the permission check.

**Files:** `backend/src/middlewares/auth.middleware.ts` (line 58)

**What's happening:**

```typescript
const isSelf = req.user.id === req.user.id;  // Always true!
```

This compares the user's ID to itself instead of checking against URL parameters.

**Impact:** Any authenticated user can bypass authorization checks on routes protected by `authorize` middleware. Users can modify/delete resources belonging to other users.

**Affected routes:**

- `PUT /api/users/:id` (users.routes.ts line 14) - any user can update any user
- `DELETE /api/users/:id` (users.routes.ts line 17) - any user can delete any user  
- `PUT /api/bookmarks/me/:id` (bookmarks.routes.ts line 19) - authorization check is ineffective
- `DELETE /api/bookmarks/me/:id` (bookmarks.routes.ts line 28) - authorization check is ineffective

**Fix approach:** Change line 58 to compare `req.user.id` against the resource owner ID from `req.params` (e.g., `req.params.userId` or `req.params.id`). Add logic to extract the correct parameter name based on route context.

---

### Insufficient Route-Level Authorization

**Problem:** Routes that modify user data use the broken `authorize` middleware instead of stronger checks.

**Files:** `backend/src/api/users/users.routes.ts` (lines 14, 17)

**Impact:** Even when the authorization bug is fixed, update/delete endpoints need additional validation to ensure users can only modify their own resources (except admins).

**Fix approach:**

- Line 14 (PUT /:id): Should verify `req.user.id === req.params.id || req.user.role === "ADMIN"`
- Line 17 (DELETE /:id): Should verify `req.user.id === req.params.id || req.user.role === "ADMIN"`

---

### Missing CORS Configuration

**Problem:** No CORS headers configured in the Express application.

**Files:** `backend/src/app.ts`

**Impact:** Frontend (likely running on different origin during development) cannot make cross-origin requests to the API. Browsers will block requests due to same-origin policy.

**Fix approach:** Add `cors` middleware from npm package `cors` to app.ts before route definitions. Configure appropriate allowed origins for dev/prod environments.

---

## Logic Bugs

### Bookmark Update Field Validation Bug

**Problem:** The `updateMyBookmark` controller validates the wrong variable for checking if fields exist.

**Files:** `backend/src/api/bookmarks/bookmarks.controller.ts` (line 203)

**What's happening:**

```typescript
const status = req.body.status;  // string
const fieldsToUpdate = { userId, status, updatedAt };

const hasFields = Object.keys(status).length > 0;  // Checking string keys, not object keys!
```

**Impact:** The validation always evaluates to 0 (strings don't have meaningful enumerable keys), causing the endpoint to reject all valid requests with a 400 error.

**Fix approach:** Change line 203 from `Object.keys(status)` to `Object.keys(fieldsToUpdate)` to check the actual fields being updated.

---

### User Update Function Reference Bug

**Problem:** The `updateMe` controller checks a function name instead of the variable result.

**Files:** `backend/src/api/users/users.controller.ts` (line 155)

**What's happening:**

```typescript
const updatedMe = await UserService.alterUser(id, fieldsToUpdate);
if (!updateMe) {  // Checking function name, not variable!
  // This condition is always true (function is truthy)
  return next({ status: 500 });
}
```

**Impact:** When a user successfully updates their profile, the endpoint incorrectly returns a 500 error. However, if the database update actually fails (returns falsy), this check won't catch it.

**Fix approach:** Change line 155 from `!updateMe` to `!updatedMe` (correct variable name).

---

### Password Validation Constraint Mismatch

**Problem:** Password validation regex and Zod schema have conflicting requirements.

**Files:** `backend/src/middlewares/validation.middleware.ts` (lines 8-10)

**What's happening:**

```typescript
const passwordSchema = z
  .string()
  .min(8)  // Requires minimum 8 characters
  .regex(/^(?=.*[A-Z])(?=.*[0-9]).{6,}$/);  // Regex allows 6+ characters
```

**Impact:** Passwords meeting the regex requirement (6+ chars) but not Zod's min(8) will be rejected. The regex should be `.{8,}` instead of `.{6,}` to match the schema.

**Fix approach:** Update the regex pattern to `.{8,}` to require minimum 8 characters, matching the `.min(8)` constraint.

---

### Bookmark Update Field Validation (Also Line 158)

**Problem:** Same issue exists in the `updateBookmark` controller.

**Files:** `backend/src/api/bookmarks/bookmarks.controller.ts` (line 158)

**Impact:** Identical to updateMyBookmark bug - endpoint rejects valid update requests.

**Fix approach:** Change line 158 from `Object.keys(status)` to `Object.keys(fieldsToUpdate)`.

---

## Routing Issues

### Duplicate Route Handlers

**Problem:** Two different handlers registered for the same route path, with only the first one being reachable.

**Files:** `backend/src/api/bookmarks/bookmarks.routes.ts` (lines 30-40)

**What's happening:**

```typescript
bookmarkRouter.delete("/", authenticateUser, authorizeAdminOnly, BookmarkController.deleteAllBookmarksFromUser);  // Line 30-34
bookmarkRouter.delete("/", authenticateUser, authorizeAdminOnly, BookmarkController.deleteAllBookmarks);  // Line 36-40
```

**Impact:** Both routes respond to `DELETE /api/bookmarks/`. Express matches the first route, so `deleteAllBookmarks` is unreachable. The route ordering matters - the second definition is shadowed.

**Fix approach:** Either:

1. Combine these into one handler that checks for userId in params and deletes accordingly
2. Use different URL paths (e.g., `DELETE /:userId/all` for user-specific deletion)
3. Use query parameters to distinguish the operation (e.g., `DELETE /?scope=all` vs `DELETE /?scope=user&userId=xyz`)

---

## Code Quality Issues

### Significant Code Duplication

**Problem:** Multiple controller functions contain nearly identical logic that differs only in how userId is obtained.

**Files:** `backend/src/api/bookmarks/bookmarks.controller.ts`

**Duplicated patterns:**

- `createBookmark` (lines 57-97) and `createMyBookmark` (lines 99-134)
- `updateBookmark` (lines 136-173) and `updateMyBookmark` (lines 175-218)
- `deleteBookmark` (lines 220-238) and `deleteMyBookmark` (lines 240-264)
- `deleteAllBookmarksFromUser` (lines 273-286) and `deleteAllMyBookmarks` (lines 288-306)

**Impact:** Maintenance burden - bug fixes or feature changes must be applied in multiple places. Increases chance of inconsistencies.

**Fix approach:** Extract userId resolution to middleware or a helper function. Create generic handlers that work for both user-scoped and admin-scoped operations. Example pattern:

```typescript
const resolveUserId = (req, isUserScoped) => isUserScoped ? req.user?.id : req.params.userId;
```

---

### No Input Validation for Update Payloads

**Problem:** Bookmark and Rating update endpoints accept any fields without schema validation.

**Files:** `backend/src/api/bookmarks/bookmarks.controller.ts`, `backend/src/api/ratings/ratings.controller.ts`

**Impact:** Clients can send unexpected fields that silently fail or cause unexpected behavior. No protection against invalid enum values being stored.

**Fix approach:** Add Zod schema validation for `UpdateBookmarkBodyReq` and similar update request types. Validate that only expected fields are present and have correct types.

---

## Test Coverage Gaps

### No Tests Exist

**Problem:** Project has no automated tests despite having Node.js test infrastructure configured.

**Files:** None - zero test files in `backend/src`, `frontend/src`

**Current infrastructure:**

- `backend/package.json` has `test` script: `node --test --env-file=.env **/*.test.ts`
- Jest/Vitest not configured in either project

**Risk areas without tests:**

- Auth flow (login, register, token refresh) - critical security path
- Authorization middleware (which has known bugs)
- Database operations and schema relationships
- Bookmark/Rating CRUD operations
- Password validation and hashing
- Cascade deletes when users are removed

**Priority for new tests:**

1. **High:** Authorization middleware and route handlers
2. **High:** Authentication flow (login/register/refresh)
3. **Medium:** Bookmark CRUD with user isolation
4. **Medium:** Validation middleware
5. **Medium:** Database cascade deletes

**Fix approach:** Introduce testing framework (Node.js built-in or Jest), create test files co-located with source files using `*.test.ts` pattern, aim for >80% coverage on critical paths.

---

## Database & Data Integrity Issues

### Unhandled Database Query Failures

**Problem:** CRUD operations in service layer don't handle cases where database operations return empty results.

**Files:** `backend/src/api/bookmarks/bookmarks.service.ts` (lines 29-36), `backend/src/api/ratings/ratings.service.ts` (lines 39-46)

**What's happening:**

```typescript
export const alterBookmark = async (id: string, bookmark: Partial<Bookmark>): Promise<Bookmark> => {
  const [newBookmark] = await db
    .update(bookmarksTable)
    .set(bookmark)
    .where(eq(bookmarksTable.id, id))
    .returning();

  return newBookmark;  // Could be undefined if no rows matched
};
```

**Impact:** If a bookmark doesn't exist, `newBookmark` is undefined, but the function returns it as a valid Bookmark. Controller code checks `if (!newBookmark)` but the return type claims Bookmark (non-nullable).

**Fix approach:** 

1. Return `Bookmark | null` from service
2. Check if the update actually affected any rows
3. Controller should handle null case and return 404

---

### Sensitive Data Exposed in Logs

**Problem:** Controllers and services log full objects that may contain sensitive data.

**Files:** 

- `backend/src/api/bookmarks/bookmarks.controller.ts` (lines 95, 132, 170, 215)
- `backend/src/api/users/users.controller.ts` (line 81, 160)

**What's happening:**

```typescript
databaseLogger.info(`Bookmark ${newBookmark.id} created`, newBookmark);  // Logs entire object
databaseLogger.info(`You are updated`, updateMe);  // Could include password before fix
```

**Impact:** If logs are sent to external services or stored insecurely, sensitive data (passwords in old logs, API keys if added) would be exposed.

**Fix approach:** 

1. Never log full request/response bodies in production
2. Exclude sensitive fields when logging user/auth data
3. Log only IDs and necessary metadata in production
4. Use structured logging with field filtering

---

## Missing Features & Gaps

### No Refresh Token Revocation

**Problem:** Once a refresh token is issued, there's no mechanism to revoke it (e.g., on logout).

**Files:** `backend/src/api/auth/auth.routes.ts`, `backend/src/api/auth/auth.service.ts`

**Impact:** Users cannot explicitly log out - their refresh token remains valid until expiration. If a token is compromised, it continues to work.

**Fix approach:** Add a logout endpoint that deletes the user's refresh tokens from the database.

---

### No Rate Limiting

**Problem:** No rate limiting on authentication endpoints, making brute force attacks possible.

**Files:** `backend/src/api/auth/auth.routes.ts`

**Impact:** Attackers can brute force login credentials without any throttling.

**Fix approach:** Add rate limiting middleware (e.g., express-rate-limit) to auth endpoints, especially `/login`.

---

### No Request Validation for Bookmark Status Updates

**Problem:** The UpdateBookmarkBodyReq type accepts any BookmarkStatus but doesn't validate enum transitions.

**Files:** `backend/src/types/db.types.ts`, `backend/src/api/bookmarks/bookmarks.controller.ts`

**Impact:** Invalid status transitions (e.g., COMPLETED → WATCHING) are not prevented by the API.

**Fix approach:** Add business logic validation for allowed status transitions, or document valid transitions in API docs.

---

## Configuration & Deployment Issues

### Missing Environment Variable Validation at Startup

**Problem:** Database connection errors during startup don't provide clear messaging to help diagnose configuration issues.

**Files:** `backend/src/config/db.ts`, `backend/src/index.ts`

**Impact:** If DATABASE_URL is invalid or the database is unreachable, the application exits silently without clear error context.

**Fix approach:** Add explicit try-catch around `connectDb()` with user-friendly error messages indicating the specific configuration issue.

---

### Inconsistent Node.js Runtime Behavior

**Problem:** The application uses `--watch` flag in start scripts, which is unusual for production.

**Files:** `backend/package.json` (line 8)

**What's happening:**

```json
"start": "node --watch --env-file=.env dist/index.js"
```

**Impact:** Using `--watch` in production means the server restarts whenever code files change, causing downtime. This is meant for development.

**Fix approach:** Separate dev and prod start scripts. Production script should not use `--watch`.

---

## Performance Considerations

### N+1 Query Pattern in Refresh Token Validation

**Problem:** The refresh endpoint loops through all user's refresh tokens to find a match.

**Files:** `backend/src/api/auth/auth.service.ts` (lines 76-88)

**What's happening:**

```typescript
const storedTokens = await db.select().from(refreshTokensTable).where(eq(refreshTokensTable.userId, payload.sub));

let matchedToken: RefreshToken | null = null;
for (const stored of storedTokens) {
  const matches = await bcrypt.compare(refreshToken, stored.tokenHash);  // Bcrypt comparison for each token
  if (matches) {
    matchedToken = stored;
    break;
  }
}
```

**Impact:** For users with many refresh tokens (legitimate ones + old ones), this requires:

- One database query to fetch all tokens
- N bcrypt comparisons (CPU intensive)
- Potential delay in token refresh

**Fix approach:** Limit stored refresh tokens per user (e.g., keep only 5 most recent). Implement indexed lookup if token validation can be made faster.

---

### No Pagination on GET Endpoints

**Problem:** `GET /api/users` and `GET /api/bookmarks` return all records without pagination or limits.

**Files:** `backend/src/api/users/users.service.ts`, `backend/src/api/bookmarks/bookmarks.service.ts`

**Impact:** As the database grows, these endpoints become increasingly slow and memory-intensive. A large dataset could crash the server.

**Fix approach:** Implement cursor-based or offset/limit pagination on collection endpoints. Set reasonable defaults (e.g., 50 items per page).

---

## Type Safety Issues

### Incomplete TypeScript Coverage

**Problem:** Express request/response type annotations are minimal in some middleware and controllers.

**Files:** Multiple controller files use generic types like `async (req, res, __)`

**Impact:** Reduces IDE autocompletion and type checking for request/response objects.

**Fix approach:** Use generic types consistently: `asyncFn<Params, Query, Body>` and ensure all handler signatures are properly typed.

---

### UserParams Type Mismatch

**Problem:** The `UserParams` interface doesn't match how it's used in routes.

**Files:** `backend/src/types/db.types.ts` (lines 30-33)

**What's happening:**

```typescript
export interface UserParams {
  id: string;
  email: string;  // Why is email in route params?
}
```

Routes only have `/:id`, not `/:id/:email`. This type is misleading.

**Fix approach:** Define separate types for different URL param patterns:

- `UserIdParam` with just `{ id: string }`
- `BookmarkParams` with `{ id: string, userId?: string }`

---

## Summary by Priority

| Issue | Severity | Category | Effort |
|-------|----------|----------|--------|
| Production server doesn't listen | Critical | Deployment | Low |
| Authorization middleware bypass | Critical | Security | Low |
| User can modify/delete other users | Critical | Security | Medium |
| Missing CORS config | High | Backend | Low |
| Bookmark update validation bug | High | Logic | Low |
| User update function bug | High | Logic | Low |
| No tests exist | High | Quality | High |
| Duplicate routes | Medium | Routing | Low |
| Code duplication in controllers | Medium | Quality | Medium |
| Unhandled DB failures | Medium | Data | Medium |
| Missing logout endpoint | Medium | Feature | Low |
| No rate limiting | Medium | Security | Low |
| N+1 refresh token query | Medium | Performance | Low |
| No pagination | Medium | Performance | Medium |

---

*Concerns audit: 2026-09-15*
