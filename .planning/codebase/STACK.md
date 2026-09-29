---
last_mapped_commit: de5ea76306acf12143bdc0b9c6e23ed449b8b46b
last_mapped_at: 2026-09-15
---
# Technology Stack

**Analysis Date:** 2026-09-15

## Languages

**Primary:**

- TypeScript 5.9.3 - Backend and frontend source code
- JavaScript - Runtime execution (ESM modules)

**Build & Config:**

- TypeScript - tsconfig.json for compilation, type checking

## Runtime

**Environment:**

- Node.js (ES2017+ compatible) - Backend server runtime
- Browser (modern, ES2017+) - Frontend runtime

**Package Manager:**

- npm - Dependency management
- Lockfile: `package-lock.json` present in both backend and frontend

## Frameworks

**Backend:**

- Express 5.2.1 - HTTP server and routing
- Drizzle-orm 0.45.1 - TypeScript SQL query builder and ORM

**Frontend:**

- Next.js 16.1.6 - Full-stack React framework with App Router
- React 19.2.3 - UI component library
- React DOM 19.2.3 - DOM rendering

**Build & Development:**

- TypeScript 5.9.3 - Type checking and transpilation
- tsx 4.21.0 - TypeScript execution and development
- tsup 8.5.1 - Bundler for production builds
- Drizzle-kit 0.31.10 - Database schema generation and migrations
- Babel React Compiler 1.0.0 - Frontend compiler optimization (enabled in Next.js config)
- Tailwind CSS 4 - Utility-first CSS framework
- Tailwind PostCSS 4 - PostCSS plugin for Tailwind processing

## Key Dependencies

**Authentication & Security:**

- jose 6.2.2 - JWT creation and verification (HS256 algorithm)
- bcryptjs 3.0.3 - Password hashing and verification
- helmet 8.1.0 - HTTP headers security middleware for Express

**Database & ORM:**

- drizzle-orm 0.45.1 - SQL ORM with TypeScript support
- postgres 3.4.8 - PostgreSQL client library (used by Drizzle)
- pg 8.20.0 - Native PostgreSQL driver (alternative client)

**Data Validation:**

- zod 4.3.6 - Schema validation and type inference

**Logging:**

- pino 10.3.1 - High-performance JSON logger
- pino-pretty 13.1.3 - Pino formatter for human-readable output in development

**Type Definitions:**

- @types/express 5.0.6 - Express type definitions
- @types/node 25.2.1 - Node.js built-in APIs type definitions
- @types/pg 8.20.0 - PostgreSQL driver type definitions
- @types/react 19 - React component type definitions
- @types/react-dom 19 - React DOM type definitions
- @tsconfig/node-lts 24.0.0 - LTS Node.js TypeScript configuration preset

**Linting & Formatting:**

- eslint 9 - JavaScript/TypeScript linting
- eslint-config-next 16.1.6 - Next.js ESLint configuration

## Configuration

**Environment:**

- Loaded via `.env` file in backend root
- Validated with Zod schema at `src/config/dotenv.ts`
- Required environment variables:
  - `NODE_ENV` - Enum: "dev", "test", "prod" (default: "dev")
  - `PORT` - Number, default 8000
  - `DATABASE_URL` - PostgreSQL connection URL
  - `JWT_ACCESS_SECRET` - Hex string, minimum 64 characters
  - `JWT_REFRESH_SECRET` - Hex string, minimum 64 characters
  - `JWT_ACCESS_EXP` - Expiration format: `\d+[smhd]` (e.g., "15m", "7d")
  - `JWT_REFRESH_EXP` - Expiration format: `\d+[smhd]`

**Build:**

- Backend: TypeScript configuration in `backend/tsconfig.json`
  - Output directory: `dist/`
  - Source directory: `src/`
  - Path aliases: `@/*` → `src/*`, `@drizzle/*` → `src/db/drizzle/*`
- Frontend: TypeScript configuration in `frontend/tsconfig.json`
  - Path aliases: `@/*` → `src/*`
  - React Compiler enabled
- Database: Drizzle Kit configuration at `backend/drizzle.config.ts`
  - Dialect: PostgreSQL
  - Schema: `src/db/drizzle/index.ts`
  - Migrations output: `drizzle/` directory

## Database

**Type:** PostgreSQL

**Connection:**

- Client: `postgres` library (connection through `postgres://...` URL)
- Drizzle adapter: `drizzle-orm/postgres-js`
- Connection pool: Managed by postgres library
- Validation: Single connection test on startup

**Schemas:**

- Located in `backend/src/db/drizzle/schemas/`:
  - `auth.ts` - Authentication tokens and sessions
  - `users.ts` - User accounts and profiles
  - `bookmarks.ts` - Bookmark data
  - `ratings.ts` - Rating data
- Migrations: Stored in `backend/drizzle/` directory

## Platform Requirements

**Development:**

- Node.js LTS compatible (ES2017+)
- PostgreSQL server accessible via DATABASE_URL
- .env configuration file with required variables

**Production:**

- Node.js runtime (same as development)
- PostgreSQL database
- Environment variables must be set in deployment platform
- Development mode logs database info; production mode silent

---

*Stack analysis: 2026-09-15*
