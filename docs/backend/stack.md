# Backend Stack

## Language & runtime

- TypeScript 5.9, compiled/run as native ESM (`"type": "module"` in `package.json`).
- Node.js (LTS, ES2017+ target). Imports must use the `.js` extension per ESM rules.

## Framework & ORM

- **Express 5** — HTTP server and routing.
- **Drizzle ORM** (with `drizzle-kit` for migrations) — type-safe PostgreSQL queries.

## Key dependencies

| Purpose | Package |
|---|---|
| JWT creation/verification (HS256) | `jose` |
| Password hashing | `bcryptjs` |
| HTTP security headers | `helmet` |
| PostgreSQL client (used by Drizzle) | `postgres` |
| Schema/input validation | `zod` |
| Logging | `pino` (+ `pino-pretty` in dev) |

## Dev tooling

- `tsx` — run TypeScript directly in development (`--watch` for reload).
- `tsup` — bundler for production builds.
- `drizzle-kit` — schema migration generation/push/studio.
- `typescript` — type checking and (via `tsc`) the production build.

## Path aliases (`tsconfig.json`)

- `@/*` → `src/*`
- `@drizzle/*` → `src/db/drizzle/*`

## Environment variables

Loaded from `backend/.env` (not committed) and validated with a Zod schema in
`src/config/dotenv.ts` at startup:

| Variable | Meaning |
|---|---|
| `NODE_ENV` | `"dev" \| "test" \| "prod"` (default `"dev"`) |
| `PORT` | Server port (default `8000`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Hex string, 64+ chars — signs access tokens |
| `JWT_REFRESH_SECRET` | Hex string, 64+ chars — signs refresh tokens |
| `JWT_ACCESS_EXP` | Access token TTL, e.g. `"15m"` |
| `JWT_REFRESH_EXP` | Refresh token TTL, e.g. `"7d"` |

## npm scripts

```bash
npm run dev          # tsx --watch, loads .env
npm run build        # tsc → dist/
npm start            # run compiled dist/index.js
npm test             # node --test over **/*.test.ts
npm run db:generate  # drizzle-kit generate
npm run db:migrate   # drizzle-kit migrate
npm run db:push      # drizzle-kit push (dev convenience)
npm run db:studio    # drizzle-kit studio
```

See [database.md](database.md) for the schema and migration workflow, and
[architecture.md](architecture.md) for how these pieces fit together.
