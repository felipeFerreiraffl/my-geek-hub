---
last_mapped_commit: de5ea76306acf12143bdc0b9c6e23ed449b8b46b
last_mapped_at: 2026-09-15
---
# Codebase Structure

**Analysis Date:** 2026-09-15

## Directory Layout

```
my-geek-hub/
├── backend/                       # Express API server
│   ├── src/
│   │   ├── index.ts              # Entry point - database init, server startup
│   │   ├── app.ts                # Express app setup - middleware, routing
│   │   ├── api/                  # Feature modules (controller-routes-service)
│   │   │   ├── auth/             # Authentication routes, login/signup/refresh
│   │   │   ├── users/            # User management endpoints
│   │   │   ├── bookmarks/        # Bookmark CRUD endpoints
│   │   │   └── ratings/          # Rating CRUD endpoints
│   │   ├── config/               # Configuration files
│   │   │   ├── db.ts             # Database connection & Drizzle setup
│   │   │   └── dotenv.ts         # Environment variable loading
│   │   ├── constants/            # Constant values
│   │   │   ├── api.ts            # API-related constants
│   │   │   ├── dotenv.ts         # Env var exports
│   │   │   ├── numbers.ts        # Numeric constants (token expiration)
│   │   │   └── status.ts         # HTTP status message mapping
│   │   ├── db/                   # Database layer
│   │   │   └── drizzle/          # Drizzle ORM configuration
│   │   │       ├── index.ts      # Schema barrel export
│   │   │       ├── relations.ts  # Table relationship definitions
│   │   │       └── schemas/      # Table definitions
│   │   │           ├── users.ts
│   │   │           ├── bookmarks.ts
│   │   │           ├── ratings.ts
│   │   │           └── auth.ts    # refresh_tokens table
│   │   ├── libs/                 # Utility libraries
│   │   │   └── jwt.ts            # JWT token creation/verification
│   │   ├── middlewares/          # Express middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── handleError.middleware.ts
│   │   │   └── validation.middleware.ts
│   │   ├── types/                # TypeScript type definitions
│   │   │   ├── auth.types.ts
│   │   │   ├── db.types.ts       # Inferred types from schemas
│   │   │   ├── express.d.ts      # Express augmentation (req.user)
│   │   │   └── status.types.ts
│   │   └── utils/                # Utility functions
│   │       ├── logger.ts         # Pino logger setup & factory
│   │       ├── messages.ts       # Response formatting (successRes)
│   │       └── serverFn.ts       # asyncFn & middlewareFn wrappers
│   ├── drizzle/                  # Drizzle migration files
│   ├── package.json
│   ├── tsconfig.json
│   └── node_modules/
│
├── frontend/                      # Next.js React app
│   ├── src/
│   │   └── app/
│   │       ├── layout.tsx        # Root layout wrapper
│   │       └── page.tsx          # Home page
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── node_modules/
│
├── .planning/                     # Planning & analysis documents
│   └── codebase/
│       ├── ARCHITECTURE.md       # System design & data flow
│       └── STRUCTURE.md          # This file
│
└── .git/                          # Git configuration
```

## Directory Purposes

**`backend/src/`**

- Purpose: Main backend application code
- Contains: All server-side logic organized by feature modules
- Key files: Entry point (index.ts), app setup (app.ts)

**`backend/src/api/`**

- Purpose: Feature-based module organization
- Contains: Four feature directories (auth, users, bookmarks, ratings)
- Pattern: Each feature has controller, routes, and service files

**`backend/src/api/[feature]/`** (e.g., `users/`)

- Purpose: Single feature module with three layers
- Contains:
  - `[feature].controller.ts`: HTTP request handlers
  - `[feature].routes.ts`: Express router with middleware chains
  - `[feature].service.ts`: Business logic and data operations

**`backend/src/config/`**

- Purpose: Application configuration
- Contains: Database connection setup, environment variable loading
- Key files: `db.ts` (Drizzle ORM instance), `dotenv.ts` (env exports)

**`backend/src/constants/`**

- Purpose: Centralized constant values
- Contains: API paths, numeric constants (token expiration), HTTP status messages

**`backend/src/db/drizzle/`**

- Purpose: Database schema and ORM configuration
- Contains:
  - `index.ts`: Barrel export of all schemas
  - `relations.ts`: Many-to-one relationships between tables
  - `schemas/`: Individual table definitions using Drizzle syntax

**`backend/src/libs/`**

- Purpose: Reusable utility libraries
- Contains: JWT token generation/verification functions

**`backend/src/middlewares/`**

- Purpose: Express middleware functions
- Contains: Authentication, authorization, validation, error handling

**`backend/src/types/`**

- Purpose: TypeScript type definitions
- Contains: Inferred types from Drizzle schemas, Express request augmentation

**`backend/src/utils/`**

- Purpose: Helper functions and utilities
- Contains: Logger factory, response formatting, async handler wrappers

**`backend/drizzle/`**

- Purpose: Migration files generated by Drizzle Kit
- Generated: Yes
- Committed: Yes

**`frontend/src/app/`**

- Purpose: Next.js App Router pages and layouts
- Contains: Root layout, page components
- Pattern: File-based routing following Next.js conventions

## Key File Locations

**Entry Points:**

- Backend: `backend/src/index.ts` - Initializes DB, starts Express server
- Frontend: `frontend/src/app/layout.tsx` - Root layout component

**Configuration:**

- Database: `backend/src/config/db.ts` - Drizzle ORM instance, connection pool
- Environment: `backend/src/config/dotenv.ts` - Env var exports
- TypeScript: `backend/tsconfig.json` - Path aliases (@/*, @drizzle/*)

**Core Logic:**

- Auth: `backend/src/api/auth/` - Login, register, token refresh
- Users: `backend/src/api/users/` - User CRUD and profile endpoints
- Bookmarks: `backend/src/api/bookmarks/` - Bookmark tracking endpoints
- Ratings: `backend/src/api/ratings/` - Rating and review endpoints

**Testing:**

- None currently implemented
- Test files would go in same directories as source: `[feature].test.ts`

## Naming Conventions

**Files:**

- `[feature].controller.ts` - Controller/handler functions for a feature
- `[feature].service.ts` - Business logic and data operations
- `[feature].routes.ts` - Express router definitions
- `[entity].ts` in `/schemas/` - Database table definitions
- `.middleware.ts` - Middleware functions
- `.types.ts` - TypeScript type definitions
- `.utils.ts` or folder `/utils/` - Utility functions
- `.test.ts` - Test files (co-located with source)

**Directories:**

- Feature names: `auth`, `users`, `bookmarks`, `ratings` (lowercase, plural or singular consistently)
- Layer names: `api`, `config`, `constants`, `db`, `libs`, `middlewares`, `types`, `utils` (lowercase plural/singular as is)
- Schema folder: `schemas` (plural, contains multiple tables)
- Migration folder: `drizzle` (ORM-specific naming)

**Functions:**

- Controllers: `getX`, `createX`, `updateX`, `deleteX` (action + entity, camelCase)
- Services: `findX`, `createX`, `alterX`, `deleteX` (verb + entity, camelCase)
- Middleware: `authenticateUser`, `authorize`, `validateUser` (descriptive verb, camelCase)
- Utilities: `asyncFn`, `middlewareFn`, `hashPassword`, `successRes` (descriptive action, camelCase)

**Variables:**

- HTTP request params: `req`, `res`, `next` (Express convention)
- User data: `user`, `newUser` (singular/prefixed)
- Database tables: `users`, `bookmarks` (plural table names)
- Database queries: `[user]`, `[existingUser]` (destructured results)
- Request body data: `email`, `password`, `username` (field names match schema)

**Types:**

- Inferred from schema: `User`, `NewUser`, `Bookmark`, `NewBookmark` (PascalCase, matches table name)
- Request types: `UserBodyReq`, `BookmarkParams`, `UserUpdateReq` (suffixed with intent)
- Middleware types: `JWTAuthPayload`, `ErrorType`, `UserParams` (descriptive PascalCase)

## Where to Add New Code

**New Feature (e.g., comments):**

1. Create directory: `backend/src/api/comments/`
2. Create schema: `backend/src/db/drizzle/schemas/comments.ts`
3. Export from: `backend/src/db/drizzle/index.ts`
4. Add relations: Update `backend/src/db/drizzle/relations.ts` with comment relationships
5. Implement layers:
   - `backend/src/api/comments/comments.routes.ts`
   - `backend/src/api/comments/comments.controller.ts`
   - `backend/src/api/comments/comments.service.ts`
6. Register routes: Add `import` and `app.use("/api/comments", ...)` in `backend/src/app.ts`
7. Add types: Extend `backend/src/types/db.types.ts` with `Comment`, `NewComment` types

**New API Endpoint in existing feature:**

1. Add route in `backend/src/api/[feature]/[feature].routes.ts`
2. Add controller function in `backend/src/api/[feature]/[feature].controller.ts`
3. Add service function(s) in `backend/src/api/[feature]/[feature].service.ts`
4. Apply middleware to route based on auth/validation needs

**New Database Table:**

1. Create schema file: `backend/src/db/drizzle/schemas/[entity].ts`
2. Export from: `backend/src/db/drizzle/index.ts`
3. Add relations: `backend/src/db/drizzle/relations.ts`
4. Run migration: `npm run db:push`
5. Add types to: `backend/src/types/db.types.ts`

**New Utility/Helper:**

- Shared helpers: `backend/src/utils/` folder or existing utility file
- Middleware: `backend/src/middlewares/[purpose].middleware.ts`
- Library (JWT, hashing): `backend/src/libs/[domain].ts`
- Type definitions: `backend/src/types/[domain].types.ts`

**Frontend Pages:**

1. Create route file: `frontend/src/app/[route]/page.tsx`
2. Follow Next.js App Router conventions
3. Use existing layout from `frontend/src/app/layout.tsx`

## Special Directories

**`backend/drizzle/`**

- Purpose: Drizzle ORM migration history
- Generated: Yes (by `npm run db:generate` and `npm run db:migrate`)
- Committed: Yes (migrations are version-controlled)

**`backend/.env`** (not shown in tree, use .env.example)

- Purpose: Environment variables (secrets, DB_URL, JWT secrets)
- Generated: No - created manually for deployment
- Committed: No - should be in .gitignore

**`backend/dist/`** (generated)

- Purpose: Compiled JavaScript output from TypeScript
- Generated: Yes (by `npm run build` or `tsc`)
- Committed: No - in .gitignore

**`backend/node_modules/`**

- Purpose: NPM dependencies
- Generated: Yes (by `npm install`)
- Committed: No - in .gitignore

**`frontend/node_modules/`**

- Purpose: NPM dependencies for frontend
- Generated: Yes (by `npm install`)
- Committed: No - in .gitignore

**`.planning/codebase/`**

- Purpose: Architecture and structure analysis documents
- Generated: Yes (by `/gsd-map-codebase` skill)
- Committed: Yes - part of project documentation

---

*Structure analysis: 2026-09-15*
