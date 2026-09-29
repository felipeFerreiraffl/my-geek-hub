# Architecture (system-wide)

## Shape of the system

Two independent applications, developed and deployed separately, talking over HTTP:

```
┌─────────────────────────┐         REST / JSON        ┌──────────────────────────┐
│  frontend/  (Next.js)    │ ──────────────────────────▶ │  backend/  (Express API) │
│  React 19, App Router    │ ◀────────────────────────── │  TypeScript, ESM         │
└─────────────────────────┘                              └────────────┬─────────────┘
                                                                       │
                                                            ┌──────────▼───────────┐
                                                            │ PostgreSQL (Drizzle) │
                                                            └──────────────────────┘

                                                            ┌──────────────────────┐
                                                            │ Jikan API / RAWG API │  (planned)
                                                            └──────────────────────┘
```

- `backend/` is a standalone Express REST API. Detailed architecture:
  [docs/backend/architecture.md](../backend/architecture.md).
- `frontend/` is a Next.js application. It has no custom code yet beyond the
  default scaffold, so there is no frontend architecture doc yet — this section
  will be filled in once the app has real structure.
- The two apps are **not** part of a monorepo/workspace: each has its own
  `package.json`, lockfile, and TypeScript config. There is no shared package
  between them today.
- External catalogs (Jikan, RAWG) are planned data sources the backend will call
  to resolve/search works; bookmarks already store an `externalId` +
  `mediaType` pair designed to reference them, but no outbound integration exists
  in the code yet.

## Why two independent apps

Keeping backend and frontend as separate projects avoids coupling their release
cycles, dependency trees, and TypeScript configs. The trade-off is some
duplication (e.g. both declare their own `@/*` path alias) — see
[conventions.md](conventions.md) for how that's kept consistent.
