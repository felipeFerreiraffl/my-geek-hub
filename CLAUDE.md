# CLAUDE.md

Guidance for AI agents (and humans) working in this repository.

## What this project is

**My Geek Hub** is a personal tracker for geek media — anime, manga, and games. Users
bookmark works with a personal status (watching, completed, planned, paused, dropped),
attach a personal rating/review, and (planned) export their data as JSON. Users will
also be able to search and discover new works via the **Jikan API** (anime/manga,
MyAnimeList data) and the **RAWG API** (games) — this integration is planned but not
yet implemented in code.

## Repository layout

This is **not** a monorepo/workspace — `backend/` and `frontend/` are two independent
Node.js projects, each with its own `package.json` and lockfile.

```
my-geek-hub/
├── backend/    Express + TypeScript REST API (actively developed)
├── frontend/   Next.js app (scaffolded only — no features built yet)
├── docs/       Hand-maintained architecture & convention docs (see below)
└── .planning/  GSD workflow artifacts, incl. an automated codebase snapshot
```

- `backend/` has its own [CLAUDE.md](backend/CLAUDE.md) with backend-specific rules.
- `frontend/` has no code yet beyond the Next.js scaffold — don't assume patterns
  for it; ask before introducing structure.
- `.planning/codebase/` is a point-in-time automated analysis (stack, architecture,
  conventions, concerns). It is **not** hand-maintained — treat `docs/` as the
  source of truth and `.planning/` as historical/reference context.

## Documentation map

| Topic | Location |
|---|---|
| Project purpose & domain | [docs/general/overview.md](docs/general/overview.md) |
| Cross-app architecture | [docs/general/architecture.md](docs/general/architecture.md) |
| Repo-wide conventions (git, layout) | [docs/general/conventions.md](docs/general/conventions.md) |
| Backend architecture & data flow | [docs/backend/architecture.md](docs/backend/architecture.md) |
| Backend coding conventions | [docs/backend/conventions.md](docs/backend/conventions.md) |
| Backend stack & env vars | [docs/backend/stack.md](docs/backend/stack.md) |
| Database schema & migrations | [docs/backend/database.md](docs/backend/database.md) |
| API routes | [docs/backend/api.md](docs/backend/api.md) |
| Testing | [docs/backend/testing.md](docs/backend/testing.md) |

## Tech stack at a glance

- **Language:** TypeScript everywhere, ESM modules.
- **Backend:** Express 5, Drizzle ORM + PostgreSQL, JWT auth via `jose`, `bcryptjs`
  for hashing, `zod` for validation, `pino` for logging, `helmet` for security headers.
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4 — scaffold only.

## Working conventions

- **Language:** all code, comments, commit messages, and documentation are in
  English, regardless of the language used to discuss the work.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`).
- **Branches:** `feature/<scope>` → `develop` → `main`.
- **Backend layering:** keep the `routes → controller → service → db` separation for
  any new feature; don't collapse layers. See
  [docs/backend/architecture.md](docs/backend/architecture.md).
- **Imports:** use the `@/*` path alias over relative paths; ESM requires the `.js`
  extension even on `.ts` source files.
- Before writing backend code, check
  [docs/backend/conventions.md](docs/backend/conventions.md) for naming, error
  handling, and logging patterns already in use.
- Don't introduce a monorepo tool (workspaces, Turborepo, etc.) or shared package
  between `backend/` and `frontend/` without checking with the maintainer first —
  the two apps are intentionally independent today.
