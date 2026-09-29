---
last_mapped_commit: de5ea76306acf12143bdc0b9c6e23ed449b8b46b
last_mapped_at: 2026-09-15
---
# External Integrations

**Analysis Date:** 2026-09-15

## APIs & External Services

**Not detected** - No third-party API integrations (Stripe, AWS, Firebase, etc.) currently implemented.

## Data Storage

**Databases:**

- PostgreSQL - Primary relational database
  - Connection: `DATABASE_URL` environment variable (postgres:// URL)
  - Client: `postgres` library (Node.js native PostgreSQL driver)
  - ORM: Drizzle-orm v0.45.1
  - Connection pool: Managed by postgres library with automatic pooling
  - Validation: Connection tested on application startup via `SELECT 1` query

**File Storage:**

- Local filesystem only - No cloud storage service integration

**Caching:**

- Not detected - No caching layer (Redis, Memcached) currently implemented

## Authentication & Identity

**Auth Provider:** Custom JWT-based authentication

**Implementation:**

- JWT library: `jose` (v6.2.2)
- Algorithm: HS256 (HMAC SHA-256)
- Tokens:
  - Access token: Short-lived token for authenticated requests
  - Refresh token: Long-lived token for obtaining new access tokens
  - Secrets stored in environment variables (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`)
  - Expiration: Configured per environment via `JWT_ACCESS_EXP`, `JWT_REFRESH_EXP`
- Password hashing: `bcryptjs` (v3.0.3) with 10 salt rounds
- Middleware: `src/middlewares/auth.middleware.ts`
  - Authenticates users by verifying access token
  - Enforces authorization via roles (USER, ADMIN)
- Token storage: Refresh tokens stored in `refreshTokens` database table

**Routes:**

- `POST /api/auth/login` - User login, returns access and refresh tokens
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh expired access token

## Authorization

**Roles & Permissions:**

- USER - Default role for regular users
- ADMIN - Elevated permissions for administrative operations
- Middleware: `authenticateUser()`, `authorize()`, `authorizeAdminOnly()`
- Location: `src/middlewares/auth.middleware.ts`

## Monitoring & Observability

**Logging:**

- Logger: Pino (v10.3.1) with `pino-pretty` formatter
- Location: `src/utils/logger.ts`
- Output: JSON in production, human-readable in development
- Database info logged on startup (dev mode only)
- Performance metrics: Connection latency, database size, table count

**Error Tracking:**

- Not detected - Custom error handler middleware only
- Middleware: `src/middlewares/handleError.middleware.ts`
- Error responses: Structured error objects sent to clients

**Metrics & Performance:**

- Not detected - No APM or metrics collection service

## CI/CD & Deployment

**Hosting:** Not detected - Application setup is local development focused

**CI Pipeline:** Not detected

**Deployment Notes:**

- Application starts with environment validation via Zod
- Development mode: Server logs to console on successful start
- Production mode: Silent startup, requires NODE_ENV=prod
- Bootstrap script: `bootstrap()` in `src/index.ts` handles initialization and error handling

## Security

**Packages:**

- Helmet v8.1.0 - HTTP security headers middleware
  - Attached to Express app in `src/app.ts`
  - Sets secure defaults: CSP, HSTS, X-Frame-Options, etc.

**Password Security:**

- bcryptjs for hashing with salt rounds configuration
- Refresh token hashing with bcryptjs before database storage

## Environment Configuration

**Required Environment Variables:**

- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Application environment ("dev", "test", "prod")
- `PORT` - Server port (default: 8000)
- `JWT_ACCESS_SECRET` - Access token signing key (hex, 64+ chars)
- `JWT_REFRESH_SECRET` - Refresh token signing key (hex, 64+ chars)
- `JWT_ACCESS_EXP` - Access token expiration (e.g., "15m", "1h")
- `JWT_REFRESH_EXP` - Refresh token expiration (e.g., "7d")

**Validation Location:** `src/config/dotenv.ts` (Zod schema validation)

**Configuration Loading:** 

- Node.js `--env-file=.env` flag in development and start scripts
- File location: `backend/.env`

## Backend API Routes

**Authentication:**

- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new user
- `POST /api/auth/refresh` - Refresh access token

**Users:**

- `GET /api/users` - List all users (requires authentication)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

**Bookmarks:**

- `GET /api/bookmarks` - List bookmarks
- `GET /api/bookmarks/:id` - Get bookmark by ID
- `POST /api/bookmarks` - Create bookmark
- `PUT /api/bookmarks/:id` - Update bookmark
- `DELETE /api/bookmarks/:id` - Delete bookmark

**Ratings:**

- `GET /api/ratings` - List ratings
- `GET /api/ratings/:id` - Get rating by ID
- `POST /api/ratings` - Create rating
- `PUT /api/ratings/:id` - Update rating
- `DELETE /api/ratings/:id` - Delete rating

## Data Format

**API Communication:**

- Format: JSON
- Content-Type: `application/json`
- Validation: Zod schemas for request/response data

**Request Validation:**

- Located in service and controller layers
- Zod schema validation for input data

## Webhooks & Callbacks

**Incoming:** Not detected

**Outgoing:** Not detected

---

*Integration audit: 2026-09-15*
