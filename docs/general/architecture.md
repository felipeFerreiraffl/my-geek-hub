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
                                                            │ Tenrai API / RAWG API│  (Tenrai anime via proxy; rest planned)
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
- External catalogs (Tenrai — a Jikan v4-compatible MyAnimeList API — and RAWG)
  are the data sources the backend calls to resolve/search works; bookmarks store
  an `externalId` + `mediaType` pair designed to reference them. Today only
  Tenrai's anime endpoints are reachable,
  through a rate-limited reverse proxy (`/api/animes`); manga and RAWG are not
  integrated yet.

## Why two independent apps

Keeping backend and frontend as separate projects avoids coupling their release
cycles, dependency trees, and TypeScript configs. The trade-off is some
duplication (e.g. both declare their own `@/*` path alias) — see
[conventions.md](conventions.md) for how that's kept consistent.
