---
last_mapped_commit: de5ea76306acf12143bdc0b9c6e23ed449b8b46b
last_mapped_at: 2026-09-15
---
<!-- refreshed: 2026-09-15 -->

# Architecture

**Analysis Date:** 2026-09-15

## System Overview

```text
┌──────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                        │
│           `frontend/src/app/[...pages]`                       │
└────────────────────────┬─────────────────────────────────────┘
                         │
                    HTTP/REST
                         │
┌──────────────────────────────────────────────────────────────┐
│                      Express Server                           │
│               `backend/src/app.ts`                            │
├──────────────────────────────────────────────────────────────┤
│  Middleware Layer          Request/Response Handling          │
│  ├─ helmet (security)      ├─ errorHandler                   │
│  ├─ express.json           ├─ authenticateUser               │
│  ├─ authenticateUser       ├─ authorize                      │
│  └─ errorHandler           └─ validateUser                   │
└────────────────┬─────────────────────────┬────────────────────┘
                 │                         │
        ┌────────▼─────────┐      ┌────────▼──────────┐
        │   API Routers    │      │  Route Handlers   │
        │  `api/*/routes`  │      │ `api/*/controller`│
        └────────┬─────────┘      └────────┬──────────┘
                 │                         │
        ┌────────▼─────────────────────────▼──────┐
        │         Service Layer                    │
        │   Business Logic & Data Operations       │
        │  `api/*/service.ts`                      │
        └────────┬─────────────────────────────────┘
                 │
        ┌────────▼──────────────────────────────────┐
        │         Data Access Layer                 │
        │     Drizzle ORM & Database Queries        │
        │  `config/db.ts`, `db/drizzle/`            │
        └────────┬──────────────────────────────────┘
                 │
        ┌────────▼──────────────────────────────────┐
        │       PostgreSQL Database                 │
        │   Tables: users, bookmarks, ratings,      │
        │           refresh_tokens                  │
        └───────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Express App | Request handling, middleware setup, routing | `backend/src/app.ts` |
| Route Handlers (Controllers) | Parse requests, call services, return responses | `backend/src/api/[feature]/[feature].controller.ts` |
| Services | Business logic, data operations, validation | `backend/src/api/[feature]/[feature].service.ts` |
| Database Config | Connection pool, Drizzle instance, schema initialization | `backend/src/config/db.ts` |
| Database Schemas | Table definitions, relationships, constraints | `backend/src/db/drizzle/schemas/` |
| Middleware | Cross-cutting concerns (auth, validation, error handling) | `backend/src/middlewares/` |
| Utilities | Helpers (JWT, logging, password hashing, response formatting) | `backend/src/utils/`, `backend/src/libs/` |
| Frontend App | Next.js app structure and page routing | `frontend/src/app/` |

## Pattern Overview

**Overall:** Layered MVC architecture with feature-based organization

**Key Characteristics:**

- Three-tier separation: Controllers → Services → Data Access
- Feature-based module organization (auth, users, bookmarks, ratings)
- Middleware-based request processing pipeline
- Type-safe with TypeScript and Zod validation
- JWT-based stateless authentication
- Drizzle ORM for type-safe database queries

## Layers

**Routing Layer:**

- Purpose: Match HTTP requests to route handlers, apply middleware
- Location: `backend/src/app.ts` and `backend/src/api/[feature]/[feature].routes.ts`
- Contains: Express Router instances with middleware chains
- Depends on: Middleware layer, controller functions
- Used by: Express application entry point

**Controller Layer:**

- Purpose: Handle HTTP requests, parse inputs, orchestrate service calls
- Location: `backend/src/api/[feature]/[feature].controller.ts`
- Contains: Async route handlers with type-safe request/response handling
- Depends on: Services, middleware functions, utilities
- Used by: Route definitions

**Service Layer:**

- Purpose: Implement business logic, coordinate data operations
- Location: `backend/src/api/[feature]/[feature].service.ts`
- Contains: Pure functions for database queries, calculations, validations
- Depends on: Database configuration, ORM models, types
- Used by: Controllers

**Data Access Layer:**

- Purpose: Execute database operations with type safety
- Location: `backend/src/config/db.ts`, `backend/src/db/drizzle/`
- Contains: Database connection, schema definitions, query builders
- Depends on: PostgreSQL database, Drizzle ORM library
- Used by: Services

**Middleware Layer:**

- Purpose: Handle cross-cutting concerns before/after route handlers
- Location: `backend/src/middlewares/`
- Contains: Authentication, authorization, validation, error handling
- Depends on: JWT library, types, utilities
- Used by: Route definitions

## Data Flow

### Authentication Flow (Login/Register)

1. Client sends POST `/api/auth/login` or `/api/auth/register` with email/password (`backend/src/api/auth/auth.routes.ts:7-8`)
2. `validateUser` middleware validates email format and password strength (`backend/src/middlewares/validation.middleware.ts:12-35`)
3. Route handler calls `AuthController.signIn` or `AuthController.signUp` (`backend/src/api/auth/auth.controller.ts:7-30, 32-55`)
4. Controller calls `AuthService.login` or `AuthService.register` (`backend/src/api/auth/auth.service.ts:10-33, 35-70`)
5. Service queries database for user by email, verifies/hashes password, creates access + refresh tokens
6. Service stores hashed refresh token in `refreshTokens` table with expiration
7. Controller returns user data (password excluded) + tokens in JSON response
8. Frontend stores tokens in local/session storage for subsequent requests

### Protected Request Flow (Example: Get User Profile)

1. Client sends GET `/api/users/me` with `Authorization: Bearer <accessToken>` header
2. `authenticateUser` middleware extracts Bearer token, verifies JWT signature (`backend/src/middlewares/auth.middleware.ts:8-38`)
3. JWT verification fails with `401` if token expired or invalid
4. On success, middleware attaches decoded payload (userId, role) to `req.user` object
5. `authorize` middleware checks if user is accessing own data or is admin (`backend/src/middlewares/auth.middleware.ts:55-67`)
6. Route handler calls controller which calls service
7. Service queries database for user by ID using Drizzle ORM
8. Controller returns user data (password excluded) in JSON response

### Bookmark Management Flow

1. User sends POST `/api/bookmarks/me` with bookmark details (status, mediaType, externalId)
2. Authentication and authorization middleware validate user
3. `BookmarkController.createMyBookmark` receives request (`backend/src/api/bookmarks/bookmarks.controller.ts`)
4. Controller calls `BookmarkService.createMyBookmark` with user ID from `req.user.id`
5. Service checks for duplicate bookmark (unique constraint on userId + externalId + mediaType)
6. Service inserts into `bookmarks` table using Drizzle ORM (`backend/src/api/bookmarks/bookmarks.service.ts`)
7. Drizzle uses schema definition from `backend/src/db/drizzle/schemas/bookmarks.ts`
8. Database enforces constraints, returns created bookmark with generated ID
9. Controller returns bookmark data in response

### Rating Creation (with Cascade)

1. User sends POST `/api/ratings` with userId, bookmarkId, score, review
2. Authentication validates user owns the bookmark
3. `RatingService.createRating` inserts into `ratings` table (`backend/src/db/drizzle/schemas/ratings.ts`)
4. Drizzle enforces foreign key: bookmarkId references `bookmarks.id` with `onDelete: cascade`
5. Database constraint enforces score between 1-10 via CHECK constraint
6. If bookmark is deleted, rating cascade-deletes automatically

**State Management:**

- Authentication state: Stored in JWT tokens (access token in request header, refresh token in DB)
- Session state: None - API is stateless
- User data: Stored in PostgreSQL with Drizzle-managed queries
- Relationships: Defined in `backend/src/db/drizzle/relations.ts` for type-safe query composition

## Key Abstractions

**Async Handler Wrapper (asyncFn):**

- Purpose: Centralize error handling for async route handlers
- Location: `backend/src/utils/serverFn.ts:13-22`
- Pattern: Higher-order function wrapping express handlers, catches unhandled promise rejections
- Example usage: All controllers use `asyncFn<P, ResB, ReqB>` to wrap async functions

**Logger Prefix-based:**

- Purpose: Provide categorized logging (AUTH, DB, INFO, PROXY)
- Location: `backend/src/utils/logger.ts:11-20`
- Pattern: Factory creates logger instances with prefix, uses Pino for structured logging
- Conditional formatting: Pretty-prints in dev mode, minimal output in production

**Middleware Wrapper (middlewareFn):**

- Purpose: Type-safe synchronous middleware with generic type parameters
- Location: `backend/src/utils/serverFn.ts:5-11`
- Pattern: Higher-order function for express middleware, preserves request/response/next types
- Usage: `authenticateUser`, `authorize` middleware wrappers

**Database Query Pattern:**

- Purpose: Type-safe database operations with ORM
- Location: `backend/src/api/[feature]/[feature].service.ts`
- Pattern: Drizzle queries with select().from().where() fluent API
- Type inference: Query results automatically typed from schema definitions

## Entry Points

**Backend Server:**

- Location: `backend/src/index.ts`
- Triggers: `npm run dev` or `node --watch src/index.ts`
- Responsibilities: Initialize database connection, start Express server on PORT, log startup info

**Frontend App:**

- Location: `frontend/src/app/layout.tsx`
- Triggers: `npm run dev` or `next dev`
- Responsibilities: Next.js app initialization, layout wrapper for all pages

## Architectural Constraints

- **Threading:** Single-threaded event loop (Node.js). Database connection pooling via postgres library handles concurrent requests.
- **Global state:** Database connection singleton (`db` export from `config/db.ts`), logger instances (auth/databaseLogger), express app instance. Request-scoped state attached to `req.user` after authentication middleware.
- **Circular imports:** Path aliases (`@/*`, `@drizzle/*`) prevent circular dependencies. Module structure ensures services don't import from controllers.
- **Database transactions:** Not currently used; Drizzle supports them but auth/basic CRUD operations don't require them.
- **CORS:** Not configured - frontend and backend run on different ports during development but same origin in production would require CORS middleware.
- **Error propagation:** Errors caught by `asyncFn` wrapper and passed to `errorHandler` middleware via `next(error)`.

## Anti-Patterns

### Silent Error Swallowing

**What happens:** Some service functions return `null` on error instead of throwing (`findUserByEmail`, `login`), then controller checks for null and returns error status.

**Why it's wrong:** Doesn't distinguish between "not found" (expected) and operational errors (unexpected). Loses error context. Makes it hard to log real errors vs. expected failures.

**Do this instead:** Throw typed errors for unexpected failures; return `null` only for "not found" cases, with clear semantics. Example:

```typescript
export const findUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    return user ?? null; // Explicit: no user found
  } catch (err) {
    throw new DatabaseError("Failed to query users table", { cause: err });
  }
};
```

### Unused Middleware

**What happens:** `validation.middleware.ts` defines `validateUser` used in auth routes, but other controllers perform duplicate inline validation (e.g., checking !email in signIn controller).

**Why it's wrong:** Validation logic duplicated across controllers and middleware. Single source of truth missing. Hard to maintain consistent validation rules.

**Do this instead:** Move all input validation to middleware, remove from controllers. Create separate validators for different use cases (UserValidation, BookmarkValidation).

### Inconsistent Response Format

**What happens:** `successRes` utility sets `res.status(res.statusCode)` (current status, not the intended status parameter). Controllers pass 200/201 but response may have different status if changed mid-request.

**Why it's wrong:** Status code in response body may not match actual HTTP status sent. Breaks client expectations.

**Do this instead:** 

```typescript
export const successRes = <T>(res: Response, status = 200, data: T | T[]): void => {
  const statusMessage = STATUS_MESSAGE[status] ?? "OK";
  res.status(status).json({ // Use the status parameter, not res.statusCode
    success: true,
    status: statusMessage,
    data: data,
  });
};
```

## Error Handling

**Strategy:** Centralized error handler middleware catches all errors. HTTP error objects with status codes propagate through `next(error)`.

**Patterns:**

- Controllers call `next({ status: 400 })` for validation errors
- Controllers call `next({ status: 404 })` for not-found
- Controllers call `next({ status: 401 })` for auth failures
- `asyncFn` wrapper catches promise rejections and calls `next(error)`
- `errorHandler` middleware converts error objects to HTTP responses with status code

**Response format for errors:**

```json
{
  "success": false,
  "status": 400,
  "message": "BAD REQUEST"
}
```

## Cross-Cutting Concerns

**Logging:** 

- Pino logger via `backend/src/utils/logger.ts`
- Prefix-based loggers: `authLogger`, `databaseLogger`, `logger`
- Level: "debug" in dev, "warn" in production
- Pretty-printed in dev, structured JSON in prod

**Validation:**

- Input validation via Zod schemas in `validation.middleware.ts`
- Database-level constraints (unique, foreign keys, CHECK constraints)
- No data normalization layer - controllers handle direct validation

**Authentication:**

- JWT-based with two token types: access (short-lived) and refresh (long-lived)
- Refresh tokens stored hashed in database for revocation capability
- `authenticateUser` middleware verifies access token signature
- `authorize` middleware checks role-based access (admin vs. user)

---

*Architecture analysis: 2026-09-15*
