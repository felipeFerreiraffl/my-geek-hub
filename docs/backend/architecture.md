# Backend Architecture

## Pattern

Layered MVC with feature-based organization: **routes → controller → service → data
access**. Each feature under `src/api/<feature>/` owns its own routes, controller,
and service file — there's no shared "generic CRUD" layer.

```
┌───────────────────────────────────────────────────────────────┐
│                        Express App (app.ts)                    │
│  helmet → express.json → feature routers → errorHandler        │
└──────────────────────────────┬──────────────────────────────────┘
                                │
                  ┌─────────────▼─────────────┐
                  │   <feature>.routes.ts      │  path + middleware wiring
                  │   (auth, users, bookmarks) │
                  └─────────────┬─────────────┘
                                │
                  ┌─────────────▼─────────────┐
                  │  <feature>.controller.ts   │  parse req, call service, respond
                  └─────────────┬─────────────┘
                                │
                  ┌─────────────▼─────────────┐
                  │   <feature>.service.ts     │  business logic, Drizzle queries
                  └─────────────┬─────────────┘
                                │
                  ┌─────────────▼─────────────┐
                  │  db/drizzle/ (schemas,     │
                  │  relations) + config/db.ts │
                  └─────────────┬─────────────┘
                                │
                       PostgreSQL database
```

## Layers

| Layer | Purpose | Location |
|---|---|---|
| Routing | Match HTTP requests to handlers, attach middleware | `src/api/<feature>/<feature>.routes.ts`, mounted in `src/app.ts` |
| Controller | Parse request, call service, shape the response | `src/api/<feature>/<feature>.controller.ts` |
| Service | Business logic, Drizzle queries | `src/api/<feature>/<feature>.service.ts` |
| Data access | Connection, schema, query building | `src/config/db.ts`, `src/db/drizzle/` |
| External API proxy | Rate-limited reverse proxy to external APIs (Tenrai); no controller/service | `src/api/proxy/<target>/<target>.proxy.ts`, `src/api/proxy/<target>/<scope>/<scope>.routes.ts`, `src/config/rateLimit.ts`, `src/config/proxy.ts` |
| Middleware | Auth, validation, error handling | `src/middlewares/` |
| Utilities | Logger, response helpers, async wrappers | `src/utils/`, `src/libs/` |

## Request flow: authentication

1. `POST /api/auth/login` or `/api/auth/register` (`src/api/auth/auth.routes.ts`).
2. `validateUser` middleware checks email/password shape.
3. `AuthController.signIn` / `signUp` calls `AuthService.login` / `register`.
4. The service looks up the user, verifies/hashes the password (`bcryptjs`), and
   issues an access + refresh token pair (`jose`, HS256).
5. The refresh token is stored hashed in the `refresh_tokens` table.
6. The controller returns the user (password excluded) plus both tokens.

## Request flow: authenticated request

1. Client sends `Authorization: Bearer <accessToken>`.
2. `authenticateUser` middleware verifies the JWT and attaches the decoded payload
   to `req.user`.
3. `authorizeSelfOrAdmin` (own user id or admin) or `authorizeAdminOnly` gates the
   route when needed; `/me` routes skip this step and the controller checks
   ownership of the resource.
4. Controller → service → Drizzle query → response.

## Key abstractions

- **`asyncFn` / `middlewareFn`** (`src/utils/serverFn.ts`) — higher-order wrappers
  that give controllers/middleware typed `(req, res, next)` signatures and forward
  rejected promises to `next(error)`, so individual handlers don't need try/catch.
- **`createLogger(prefix)`** (`src/utils/logger.ts`) — factory for Pino loggers with
  a fixed prefix (`authLogger`, `databaseLogger`, `logger`, `proxyLogger`); pretty
  output in development, structured JSON in production.
- **`successRes`** (`src/utils/messages.ts`) — shared success-response shape.

## Error handling strategy

A single `errorHandler` middleware, registered last in `app.ts`, converts thrown/
forwarded error objects into HTTP responses:

```json
{ "success": false, "status": 400, "message": "BAD REQUEST" }
```

Controllers signal failure by calling `next({ status, message? })` rather than
throwing directly; `asyncFn` catches promise rejections and forwards them the same
way.

## Architectural constraints

- **Single-threaded, pooled I/O:** Node's event loop plus connection pooling in the
  `postgres` client handle concurrency; there's no worker pool.
- **No transactions yet:** Drizzle supports them, but current CRUD paths are simple
  enough not to need them.
- **Path aliases prevent cycles:** `@/*` → `src/*`, `@drizzle/*` → `src/db/drizzle/*`;
  services never import from controllers.
- **State:** the DB connection (`db` in `config/db.ts`) and logger instances are the
  only long-lived singletons; everything else is request-scoped (`req.user`).

## Entry point

`src/index.ts` calls `connectDb()`, then `checkProxy()` (`src/config/proxy.ts`, a
dev-only, non-fatal reachability check of the proxied upstream APIs), then starts
the Express app on `PORT` (`bootstrap()`). Triggered via `npm run dev` (with `tsx`) or `npm start` (compiled
output).

## Where to add new code

**New feature (e.g. `comments`):**

1. `src/db/drizzle/schemas/comments.ts` — table definition.
2. Export it from `src/db/drizzle/index.ts`; add relations in `relations.ts`.
3. `src/api/comments/comments.routes.ts`, `.controller.ts`, `.service.ts`.
4. Mount it in `src/app.ts`: `app.use("/api/comments", commentRouter)`.
5. Add inferred types to `src/types/db.types.ts`.

**New endpoint in an existing feature:** add the route in
`<feature>.routes.ts`, the handler in `<feature>.controller.ts`, and the query in
`<feature>.service.ts`, applying whatever auth/validation middleware the route needs.

**New external-API proxy scope (e.g. Tenrai `mangas`):** proxy code is grouped by
target, then by scope:

```
src/api/proxy/
└── tenrai/
    ├── tenrai.proxy.ts          # proxy factory (target URL, header stripping, caching)
    └── animes/animes.routes.ts  # scope routes, path rewrites, rate limiters
```

1. Reuse the target's factory (`tenraiProxy`) or add
   `src/api/proxy/<target>/<target>.proxy.ts` for a new target.
2. `src/api/proxy/<target>/<scope>/<scope>.routes.ts` — routes and path rewrites,
   behind the target's limiters from `src/config/rateLimit.ts` (scopes of the same
   target share them).
3. Mount it in `src/app.ts`: `app.use("/api/<scope>", <scope>Router)`.
4. Add a startup probe entry in `src/config/proxy.ts`.

**New database table:** schema file → export from `db/drizzle/index.ts` → relations
→ `npm run db:push` (dev) or `db:generate` + `db:migrate` → types in `db.types.ts`.
