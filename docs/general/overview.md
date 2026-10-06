# Project Overview

## What it is

My Geek Hub is a personal tracker for geek media — **anime**, **manga**, and
**games**. It lets a user catalog the works they follow, track personal progress on
them, and keep private notes about what they've watched, read, or played.

## Core domain concepts

- **Bookmark** — a work a user has marked, identified by an `externalId` +
  `mediaType` (`ANIME`, `MANGA`, `GAME`) pointing to an external catalog (see
  below), with a personal `status`: `WATCHING`, `COMPLETED`, `PLANNED`, `PAUSED`,
  or `DROPPED`.
- **Rating** — a personal score (1–10) and optional written review attached to a
  bookmark. One rating per bookmark.
- **User** — an account with `USER` or `ADMIN` role, authenticated via email/password.

## Features

**Implemented (backend):**

- Account creation and JWT-based authentication (access + refresh tokens).
- Creating, updating, and deleting bookmarks, scoped to the authenticated user or,
  for admins, any user.
- Rating (score 1–10) and reviewing bookmarked works, one rating per bookmark.

**Planned:**

- Exporting a user's bookmarks and ratings as JSON.
- Searching and browsing new works to bookmark, backed by external catalogs:
  - **Jikan API** for anime and manga (unofficial MyAnimeList API).
  - **RAWG API** for games.
- The frontend application itself — currently just a Next.js scaffold with no
  features built.

## Who this is for

A single codebase serving potentially multiple users (role-based: `USER` vs
`ADMIN`), used as a personal catalog/portfolio project rather than a commercial
product.

## Where to go next

- System-wide architecture: [architecture.md](architecture.md)
- Repo-wide conventions: [conventions.md](conventions.md)
- Backend-specific docs: [../backend/](../backend/)
