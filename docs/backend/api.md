# API Reference

Base path: `/api`. All bodies are JSON (`Content-Type: application/json`).
Authenticated routes require `Authorization: Bearer <accessToken>`.

Two authorization middlewares gate routes:

- `authorize` — intended for "self or admin" access (e.g. a user acting on their
  own resource).
- `authorizeAdminOnly` — restricted to `role: "ADMIN"`.

## Auth (`/api/auth`)

| Method | Path | Middleware | Description |
|---|---|---|---|
| POST | `/login` | `validateUser` | Sign in with email + password, returns access + refresh tokens |
| POST | `/register` | `validateUser` | Create an account |
| POST | `/refresh` | — | Exchange a refresh token for a new access token |

## Users (`/api/users`)

| Method | Path | Middleware | Description |
|---|---|---|---|
| GET | `/` | `authenticateUser`, `authorizeAdminOnly` | List all users |
| GET | `/me` | `authenticateUser`, `authorize` | Get the current user |
| GET | `/:id` | `authenticateUser`, `authorizeAdminOnly` | Get a user by id |
| POST | `/` | `validateUser`, `authenticateUser`, `authorizeAdminOnly` | Create a user |
| PUT | `/:id` | `authenticateUser`, `authorize` | Update a user by id |
| PUT | `/me` | `authenticateUser`, `authorize` | Update the current user |
| DELETE | `/:id` | `authenticateUser`, `authorize` | Delete a user by id |
| DELETE | `/` | `authenticateUser`, `authorizeAdminOnly` | Delete all users |

## Bookmarks (`/api/bookmarks`)

| Method | Path | Middleware | Description |
|---|---|---|---|
| GET | `/` | `authenticateUser`, `authorizeAdminOnly` | List all bookmarks |
| GET | `/me` | `authenticateUser`, `authorize` | List the current user's bookmarks |
| GET | `/:id` | `authenticateUser`, `authorizeAdminOnly` | Get a bookmark by id |
| POST | `/` | `authenticateUser`, `authorizeAdminOnly` | Create a bookmark for any user |
| POST | `/me` | `authenticateUser`, `authorize` | Create a bookmark for the current user |
| PUT | `/:id` | `authenticateUser`, `authorizeAdminOnly` | Update a bookmark by id |
| PUT | `/me/:id` | `authenticateUser`, `authorize` | Update the current user's bookmark |
| DELETE | `/:id` | `authenticateUser`, `authorizeAdminOnly` | Delete a bookmark by id |
| DELETE | `/me/:id` | `authenticateUser`, `authorize` | Delete the current user's bookmark |
| DELETE | `/me` | `authenticateUser`, `authorize` | Delete all of the current user's bookmarks |
| DELETE | `/` | `authenticateUser`, `authorizeAdminOnly` | Delete all bookmarks (admin) |

## Ratings — not yet exposed

`backend/src/api/ratings/` has a fully implemented **service** layer
(`findRatings`, `findRatingById`, `findRatingsByUserId`, `findRatingByBookmarkId`,
`createRating`, `alterRating`, `deleteRatingById`, `deleteRatingsByUserId`,
`deleteRatingByBookmarkId`, `deleteAllRatings`), but `ratings.controller.ts` and
`ratings.routes.ts` are still empty, and no rating router is mounted in
`src/app.ts`. There is currently **no HTTP endpoint** for ratings — that's the
natural next slice of backend work.

## Not yet implemented

- JSON export of a user's bookmarks/ratings.
- Search/browse endpoints backed by Jikan (anime/manga) or RAWG (games).
