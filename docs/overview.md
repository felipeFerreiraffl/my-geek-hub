# Overview

General explanation of what My Geek Hub is and what it does.

## What it is

**My Geek Hub** is a personal library for **animes**, **mangas** and **games**. Each user keeps their own list of works, tracks their progress on each one and writes personal reviews.

## Main features

| Feature | Description | Status |
|---|---|---|
| Account | Sign up, sign in and session with JWT tokens. | Implemented |
| Bookmarks | Save a work in the personal library with a status. | Implemented |
| Ratings | Give a personal rating and review to a work. | Implemented |
| Search | Find animes, mangas and games through the reverse proxy. | Animes only |
| Export | Download the library data as JSON. | Coming soon |

### Bookmark status

Each saved work has one of these status:

| Status | Meaning |
|---|---|
| `IN_PROGRESS` | Watching, reading or playing. |
| `COMPLETED` | Finished. |
| `PLANNED` | Plan to start. |
| `PAUSED` | Stopped for now. |
| `DROPPED` | Gave up. |

## Where the content comes from

The works are not created by the users: they come from external APIs, accessed through the backend reverse proxy.

| Media | Source |
|---|---|
| Animes | [Tenrai](https://api.tenrai.org/v1) (MyAnimeList data, Jikan-compatible) |
| Mangas | Tenrai (coming soon) |
| Games | [RAWG](https://rawg.io/apidocs) (coming soon) |

The library only stores a reference to the work (external ID and media type), its title and image. The full details are always fetched from the external API.

## Status of the apps

- **Backend:** actively developed — account, bookmarks, ratings and anime proxy implemented.
- **Frontend:** not implemented yet.

## Next reads

- [architecture.md](architecture.md) — how the project is organized and how the apps communicate.
- [convention.md](convention.md) — language, commits, branches and secrets.
- [backend/](backend/) — backend architecture, stack and conventions.
