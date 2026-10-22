# CLAUDE.md — backend

Scope: `backend/` only. See the [root CLAUDE.md](../CLAUDE.md) for project-wide
context. Full detail lives in [../docs/backend/](../docs/backend/).

## Stack

Express 5 · Drizzle ORM · PostgreSQL · TypeScript (ESM) · `jose` (JWT) · `bcryptjs` ·
`zod` · `pino` · `helmet`. Details: [../docs/backend/stack.md](../docs/backend/stack.md).

## Structure

Feature-based, layered MVC. Each feature under `src/api/<feature>/` has three files:

```
<feature>.routes.ts       Express Router — path + middleware wiring only
<feature>.controller.ts   Parses req, calls service, sends res / calls next(err)
<feature>.service.ts      Business logic + Drizzle queries, no req/res
```

Exception: reverse proxies to external APIs live under `src/api/proxy/<target>/`
(`<target>.proxy.ts` factory + `<scope>/<scope>.routes.ts`), with no controller or
service. Use the `proxy-route` skill to add a new scope.

Other directories: `config/` (db, env, rate limits, proxy probes), `constants/`, `db/drizzle/` (schemas +
relations), `libs/` (JWT), `middlewares/` (auth, validation, error handling),
`types/`, `utils/` (logger, response helpers, async wrappers).

Full breakdown of each folder:
[../docs/backend/architecture.md](../docs/backend/architecture.md).

## Conventions (see [../docs/backend/convention.md](../docs/backend/convention.md) for full detail)

- File names are camelCase with a role suffix (`handleError.middleware.ts`,
  `bookmarks.service.ts`); module-level fixed values are `SCREAMING_SNAKE`.
- Imports use the `@/*` alias (`@/config/db.js`), or `@shared/*` for the root `shared/`
  folder, and always include the `.js`
  extension — this is an ESM project, not CommonJS.
- Services are imported as a namespace: `import * as UserService from "@/api/users/users.service.js"`.
- No barrel files (`index.ts` re-exports) inside `api/`.
- Controllers return `void` — respond via `res.json()` / `successRes()` or forward
  errors with `next({ status, message })`; don't `throw` from a controller.
- Async route handlers must be wrapped in `asyncFn(...)` (from `utils/serverFn.ts`)
  so rejected promises reach the error handler.
- Logging goes through the prefixed loggers in `utils/logger.ts`
  (`authLogger`, `databaseLogger`, `logger`, `proxyLogger`) — don't use `console.*`.
- Input validation is Zod-based, applied in `middlewares/validation.middleware.ts`
  or inline with `z.object(...).safeParse(...)`.

## Database

Drizzle ORM against PostgreSQL. Schemas in `src/db/drizzle/schemas/`, relations in
`src/db/drizzle/relations.ts`, migrations in `drizzle/`. Folder overview:
[../docs/backend/architecture.md](../docs/backend/architecture.md).

```bash
npm run db:generate   # generate a migration from schema changes
npm run db:migrate    # apply migrations
npm run db:push       # push schema directly (dev convenience)
npm run db:studio     # open Drizzle Studio
```

## Testing

Node's built-in test runner (`node --test`), files named `*.test.ts` co-located with
the source they test. No tests exist yet — ask before setting up the first ones.

## Current implementation status

- `auth`, `users`, `bookmarks`, `ratings`: routes, controllers, and
  services implemented.
- Proxy: Tenrai `animes` scope implemented; Tenrai mangas and RAWG games coming soon.
