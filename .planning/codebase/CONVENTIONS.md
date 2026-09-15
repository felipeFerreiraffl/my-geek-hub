---
last_mapped_commit: de5ea76306acf12143bdc0b9c6e23ed449b8b46b
last_mapped_at: 2026-09-15
---
# Coding Conventions

**Analysis Date:** 2026-09-15

## Naming Patterns

**Files:**

- Controllers: `[feature].controller.ts` - Route handlers (e.g., `users.controller.ts`)
- Services: `[feature].service.ts` - Business logic and database queries (e.g., `bookmarks.service.ts`)
- Routes: `[feature].routes.ts` - Express route definitions (e.g., `auth.routes.ts`)
- Middlewares: `[name].middleware.ts` - Express middleware (e.g., `handleError.middleware.ts`)
- Types: `[domain].types.ts` - TypeScript type definitions (e.g., `db.types.ts`, `auth.types.ts`)
- Utilities: descriptive camelCase (e.g., `logger.ts`, `messages.ts`, `serverFn.ts`)

**Functions:**

- camelCase: `getUsers()`, `findUserById()`, `createBookmark()`, `deleteAllUsers()`
- Verb-noun pattern in services: `find*`, `create*`, `alter*`, `delete*`
- Action-based in controllers: `get*`, `create*`, `update*`, `delete*`
- Higher-order functions (wrappers): `asyncFn()`, `middlewareFn()`, `createLogger()`

**Variables:**

- camelCase for all variables and parameters: `userId`, `emailSchema`, `existingUser`, `fieldsToUpdate`
- Destructuring preferred: `const { id, status } = req.params`
- Loop variables: `id`, `user` (no abbreviated single letters except in short scopes)

**Types/Interfaces:**

- PascalCase: `User`, `Bookmark`, `UserBodyReq`, `BookmarkParams`
- Request types: `[Domain]BodyReq` for request body (e.g., `UserBodyReq`)
- Params types: `[Domain]Params` for URL parameters (e.g., `BookmarkParams`)
- Literal union types for enums: `"ADMIN" | "USER"` instead of enum keyword

**Constants:**

- UPPER_SNAKE_CASE for environment and configuration constants: `NODE_ENV`, `PORT`, `JWT_ACCESS_SECRET`, `ACCESS_EXPIRED_TIME`
- UPPER_SNAKE_CASE for status messages: `STATUS_MESSAGE`
- Declared at module level, often in `constants/` directory

**Database:**

- Table names: lowercase plural (e.g., `users`, `bookmarks`, `ratings`, `refreshTokens`)
- Schema table references imported as: `import { users as usersTable } from "@/db/drizzle/index.js"`

## Code Style

**Formatting:**

- No Prettier config (backend) or ESLint config (backend) — style is implicit
- Frontend uses ESLint with Next.js config (`eslint.config.mjs`)
- Line breaks: Functions separated by blank line
- Indentation: 2 spaces (implicit from code)
- Semicolons: Used consistently throughout

**Imports:**

- Absolute path imports via `@/` alias preferred over relative paths
- External imports first, then internal: `import express from "express"` → `import { db } from "@/config/db.js"`
- Path aliases configured in `tsconfig.json`:
  - Backend: `@/*` → `./src/*`, `@drizzle/*` → `./src/db/drizzle/*`
  - Frontend: `@/*` → `./src/*`
- Wildcard imports for services: `import * as UserService from "@/api/users/users.service.js"`
- `.js` extension required in import statements (ESM modules)

**Exports:**

- Named exports as `export const`: `export const getUsers = asyncFn(...)`
- Default exports for single entities: `export default app` (in app.ts), `export default userRouter` (in routes)
- Service modules export multiple functions: `export const findAllUsers = ...`, `export const createUser = ...`
- Namespaced import pattern in controllers: `import * as UserService` then `UserService.findUserById()`

## Error Handling

**Patterns:**

- Express error handler middleware at app level: `app.use(errorHandler)` (in `app.ts`)
- Error object passed to `next()` with status code: `next({ status: 404 })`, `next({ status: 500 })`
- Optional error message in error object: `next({ status: 401, message: "TOKEN_EXPIRED" })`
- Error handler extracts status and maps to HTTP response: `res.status(status).json({ success: false, status, message })`
- Async function wrapper (`asyncFn`) catches all errors and passes to next: `fn(req, res, next).catch((error) => next(error))`

**Validation:**

- Zod schemas for input validation: `z.string().min(8)`, `z.email()`
- Middleware validates request body: `validateUser` middleware checks email and password
- Validation errors logged with databaseLogger: `databaseLogger.error("Invalid email format", validError.message)`
- Failed validation passes `{ status: 400 }` to next()

**JWT Error Handling:**

- Specific error type checking: `if (err instanceof errors.JWTExpired)` from `jose` package
- Expired token: `next({ status: 401, message: "TOKEN_EXPIRED" })`
- Invalid token: `next({ status: 401, message: "TOKEN_INVALID" })`

## Logging

**Framework:** Pino (`pino` and `pino-pretty`)

**Logger Configuration:**

- Created with factory function `createLogger(prefix)` in `utils/logger.ts`
- Development: debug level with pretty-printed output; Production: warn level
- Logger instance includes prefix in every log: `pinoLogger.info({ prefix, data }, message)`

**Logger Instances:**

- `logger` - General purpose logging (prefix: "INFO")
- `authLogger` - Authentication/authorization logging (prefix: "AUTH")
- `databaseLogger` - Database operation logging (prefix: "DB")
- `proxyLogger` - Proxy/external call logging (prefix: "PROXY")

**Usage Patterns:**

- Success operations: `databaseLogger.info("User created", newUser)`
- Errors: `databaseLogger.error("User not found", err)`
- Warnings: `databaseLogger.warn("No user found")`
- Include data object as second parameter: `databaseLogger.info("User ID found", user)`

## Comments

**When to Comment:**

- Not heavily commented in codebase — self-documenting code preferred
- Comments appear only for non-obvious logic (not observed in samples)
- No JSDoc/TSDoc comments found in codebase
- Type annotations serve as inline documentation

## Function Design

**Size:** Small, focused functions

- Controllers: 10-50 lines per exported function
- Services: 3-15 lines per function
- Each function has single responsibility

**Parameters:**

- Express pattern: `(req, res, next)` for middleware
- Destructuring in function body for clarity: `const { id } = req.params`
- Generic types for request/response in function signature: `asyncFn<BookmarkParams, {}, BookmarkBodyReq>`

**Return Values:**

- Controllers: `void` (use `res.json()` and `next()` for responses)
- Services: Explicit return types: `Promise<User[]>`, `Promise<User | null>`, `Promise<void>`
- Null coalescing: `return bookmark ?? null` for optional results

**Wrapper Functions:**

- `asyncFn` wrapper for async controllers to catch errors
- `middlewareFn` wrapper for regular middleware
- Both are higher-order functions with generic type parameters

## Module Design

**Architecture:** Layered MVC pattern

- **Controllers** (`api/[feature]/[feature].controller.ts`): Request handling, validation, response
- **Services** (`api/[feature]/[feature].service.ts`): Business logic, database queries
- **Routes** (`api/[feature]/[feature].routes.ts`): Route definitions and middleware composition
- **Middleware** (`middlewares/`): Cross-cutting concerns (auth, error handling, validation)
- **Types** (`types/`): Shared type definitions
- **Utils** (`utils/`): Helper functions (logger, messages, serverFn)
- **Config** (`config/`): Configuration and initialization (database, environment)
- **Libs** (`libs/`): Library wrappers (JWT utilities)

**Dependencies:**

- Controllers depend on Services and Utils
- Services depend on Config and Types
- Routes depend on Controllers and Middlewares
- No circular dependencies observed

**No Barrel Files:**

- Explicit imports required: `import * as UserService from "@/api/users/users.service.js"`
- No index.ts re-exports in api directories

## Database Interactions

**ORM:** Drizzle ORM

**Type Patterns:**

- Model types inferred from schema: `type User = InferSelectModel<typeof users>`
- Insert types separate: `type NewUser = InferInsertModel<typeof users>`
- Partial types for updates: `Partial<User>`

**Query Patterns:**

- Service functions query database with typed returns
- Destructuring array results: `const [user] = await db.select()...` (returns array)
- Null coalescing for optional results: `return user ?? null`
- Drizzle `eq()` operator for WHERE clauses: `where(eq(usersTable.id, id))`
- `returning()` clause to get inserted/updated records

## Testing Considerations

**Validation Framework:** Zod is used throughout for runtime type checking

- Environment validation: `z.enum()`, `z.url()`, `z.hex()`
- Request validation: `z.string().min()`, `z.email()`

---

*Convention analysis: 2026-09-15*
