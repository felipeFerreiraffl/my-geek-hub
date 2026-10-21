# CLAUDE.md

Guidance for AI agents (and humans) working in this repository.

## What this project is

**My Geek Hub** is a personal tracker for geek media — anime, manga, and games. Users
bookmark works with a personal status (watching, completed, planned, paused, dropped),
attach a personal rating/review, and (planned) export their data as JSON. Users
search and discover works through a backend reverse proxy to the **Tenrai API**
(anime/manga, MyAnimeList data, Jikan-compatible) and the **RAWG API** (games) — only
the Tenrai anime scope is implemented so far.

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
| Project purpose & domain | [docs/overview.md](docs/overview.md) |
| Cross-app architecture, proxy, AI tooling | [docs/architecture.md](docs/architecture.md) |
| Repo-wide conventions (language, git, secrets) | [docs/convention.md](docs/convention.md) |
| Backend folder structure & layering | [docs/backend/architecture.md](docs/backend/architecture.md) |
| Backend naming, file creation & code patterns | [docs/backend/convention.md](docs/backend/convention.md) |
| Backend stack, scripts & env vars | [docs/backend/stack.md](docs/backend/stack.md) |

Frontend docs (`docs/frontend/`) will be added once the frontend has real structure.

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
  [docs/backend/convention.md](docs/backend/convention.md) for naming, error
  handling, and logging patterns already in use.
- Don't introduce a monorepo tool (workspaces, Turborepo, etc.) or shared package
  between `backend/` and `frontend/` without checking with the maintainer first —
  the two apps are intentionally independent today.
