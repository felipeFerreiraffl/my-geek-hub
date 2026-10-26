# Backend stack

Explanation of the libraries and tools used by the backend. Exact versions are in `backend/package.json`, except `zod`, which lives in the root `package.json`.

## Runtime

| Tool | Purpose |
|---|---|
| Node.js (LTS) | Runs the server. |
| TypeScript | Language of the project, with ESM modules (`"type": "module"`). |
| `tsx` | Runs the `.ts` files directly in development, without building. |
| `tsup` | Bundles the build into `dist/index.js`, resolving the `@/*` and `@shared/*` aliases. |

## Server

| Library | Purpose |
|---|---|
| `express` (v5) | HTTP server and routing. |
| `helmet` | Adds security headers to every response. |
| `express-rate-limit` | Limits the requests sent to the external APIs. |
| `http-proxy-middleware` | Reverse proxy to the external APIs (Tenrai, RAWG). |

## Database

| Library | Purpose |
|---|---|
| PostgreSQL | Database. |
| `drizzle-orm` | ORM: schemas, queries and relations in TypeScript. |
| `drizzle-kit` | CLI to generate and apply migrations. |
| `postgres` | PostgreSQL driver used by Drizzle (`drizzle-orm/postgres-js`). |

## Auth and validation

| Library | Purpose |
|---|---|
| `jose` | Signs and verifies JWT tokens (HS256). |
| `bcryptjs` | Hashes passwords and refresh tokens. |
| `zod` | Validates env vars and request bodies. Installed at the repo root and shared with `shared/`. |

## Logging

| Library | Purpose |
|---|---|
| `pino` | Logger. |
| `pino-pretty` | Readable, colored logs in development. |

## Scripts

```bash
npm run dev           # start with watch mode (tsx)
npm run build         # type-check (tsc --noEmit), then bundle to dist/index.js (tsup)
npm run start         # run the compiled build
npm run test          # run the tests (node --test)
npm run db:generate   # create a migration
npm run db:migrate    # apply the migrations
npm run db:push       # sync the schema directly (dev only)
npm run db:studio     # open Drizzle Studio
```

Every script that runs the app loads `backend/.env` through Node's `--env-file` flag.

## Environment variables

Validated on startup by `src/config/dotenv.ts`. If any is invalid, the server doesn't start.

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `dev` | `dev`, `test` or `prod`. |
| `HOST` | `localhost` | Host printed on startup. |
| `PORT` | `8000` | Port of the server. |
| `DATABASE_URL` | — | PostgreSQL connection URL. |
| `JWT_ACCESS_SECRET` | — | Hex string, 64+ chars. |
| `JWT_REFRESH_SECRET` | — | Hex string, 64+ chars. |
| `JWT_ACCESS_EXP` | — | Access token lifetime (e.g. `15m`). |
| `JWT_REFRESH_EXP` | — | Refresh token lifetime (e.g. `7d`). |
| `RAWG_API_KEY` | — | RAWG API key, added to every request by the proxy. |

## Next reads

- [architecture.md](architecture.md) — how the backend is organized.
- [convention.md](convention.md) — naming and how to create new files.
