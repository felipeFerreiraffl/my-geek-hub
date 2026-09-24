# My Geek Hub

A personal tracker for geek media — **anime**, **manga**, and **games**. Bookmark
the works you follow, track your status on each one (watching, completed,
planned, paused, dropped), and attach a personal rating and review.

Planned: exporting your bookmarks/ratings as JSON, and discovering new works
through the [Jikan API](https://jikan.moe/) (anime/manga) and the
[RAWG API](https://rawg.io/apidocs) (games).

## Status

- **Backend:** actively developed — authentication, users, and bookmarks are
  implemented; ratings has a data layer but no API endpoints yet.
- **Frontend:** just the default Next.js scaffold, no features built yet.

## Architecture (short version)

Two independent projects, talking over a REST API:

```
frontend/ (Next.js)  ──HTTP/JSON──▶  backend/ (Express + TypeScript)  ──▶  PostgreSQL
```

There's no monorepo tooling — `backend/` and `frontend/` each have their own
`package.json` and are run separately. Full architecture details:
[docs/general/architecture.md](docs/general/architecture.md).

## Running locally

**Prerequisites:** Node.js (LTS), a running PostgreSQL instance.

### Backend

```bash
cd backend
npm install

# create backend/.env with:
#   NODE_ENV=dev
#   PORT=8000
#   DATABASE_URL=postgres://user:password@localhost:5432/mygeekhub
#   JWT_ACCESS_SECRET=<64+ char hex string>
#   JWT_REFRESH_SECRET=<64+ char hex string>
#   JWT_ACCESS_EXP=15m
#   JWT_REFRESH_EXP=7d

npm run db:push   # sync the schema to your database
npm run dev       # starts the API on PORT (default 8000)
```

### Frontend

```bash
cd frontend
npm install
npm run dev       # starts Next.js on http://localhost:3000
```

## Documentation

| | |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Project guide for AI coding agents |
| [docs/general/](docs/general/) | Project overview, cross-app architecture, repo-wide conventions |
| [docs/backend/](docs/backend/) | Backend architecture, conventions, stack, database, API reference, testing |

`docs/frontend/` will be added once the frontend has real structure to document.
