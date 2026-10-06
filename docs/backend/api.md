# API Reference

Base path: `/api`. All bodies are JSON (`Content-Type: application/json`).
Authenticated routes require `Authorization: Bearer <accessToken>`.

Authorization works in three layers:

- `/me` routes only need `authenticateUser` — the user comes from the token.
  Handlers that act on a single owned resource (`/me/:id`) check in the controller
  that it belongs to the caller and return `404` otherwise.
- `authorizeSelfOrAdmin` — allows the request when `req.params.id` is the caller's
  own user id, or when the caller is an admin.
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
| GET | `/me` | `authenticateUser` | Get the current user |
| GET | `/:id` | `authenticateUser`, `authorizeAdminOnly` | Get a user by id |
| POST | `/` | `validateUser`, `authenticateUser`, `authorizeAdminOnly` | Create a user |
| PUT | `/me` | `authenticateUser` | Update the current user (cannot change `role`) |
| PUT | `/:id` | `authenticateUser`, `authorizeSelfOrAdmin` | Update a user by id (only admins can change `role`) |
| DELETE | `/:id` | `authenticateUser`, `authorizeSelfOrAdmin` | Delete a user by id |
| DELETE | `/` | `authenticateUser`, `authorizeAdminOnly` | Delete all users |

User responses never include the `password` hash.

## Bookmarks (`/api/bookmarks`)

| Method | Path | Middleware | Description |
|---|---|---|---|
| GET | `/` | `authenticateUser`, `authorizeAdminOnly` | List all bookmarks |
| GET | `/me` | `authenticateUser` | List the current user's bookmarks |
| GET | `/:id` | `authenticateUser`, `authorizeAdminOnly` | Get a bookmark by id |
| POST | `/` | `authenticateUser`, `authorizeAdminOnly` | Create a bookmark for any user |
| POST | `/me` | `authenticateUser` | Create a bookmark for the current user |
| PUT | `/:id` | `authenticateUser`, `authorizeAdminOnly` | Update a bookmark by id |
| PUT | `/me/:id` | `authenticateUser` | Update the current user's bookmark |
| DELETE | `/:id` | `authenticateUser`, `authorizeAdminOnly` | Delete a bookmark by id |
| DELETE | `/me/:id` | `authenticateUser` | Delete the current user's bookmark |
| DELETE | `/user/:userId` | `authenticateUser`, `authorizeAdminOnly` | Delete all bookmarks of a user |
| DELETE | `/` | `authenticateUser`, `authorizeAdminOnly` | Delete all bookmarks (admin) |

Creating a bookmark requires `status`, `mediaType`, and `externalId`; a work the
user already bookmarked (same `externalId` + `mediaType`) returns `409`.

## Ratings (`/api/ratings`)

| Method | Path | Middleware | Description |
|---|---|---|---|
| GET | `/me` | `authenticateUser` | List the current user's ratings |
| GET | `/me/bookmark/:bookmarkId` | `authenticateUser` | Get the current user's rating for a bookmark |
| GET | `/` | `authenticateUser`, `authorizeAdminOnly` | List all ratings |
| GET | `/user/:userId` | `authenticateUser`, `authorizeAdminOnly` | List a user's ratings |
| GET | `/:id` | `authenticateUser`, `authorizeAdminOnly` | Get a rating by id |
| POST | `/me` | `authenticateUser` | Rate one of the current user's bookmarks |
| POST | `/` | `authenticateUser`, `authorizeAdminOnly` | Create a rating for any user |
| PUT | `/me/:id` | `authenticateUser` | Update the current user's rating |
| PUT | `/:id` | `authenticateUser`, `authorizeAdminOnly` | Update a rating by id |
| DELETE | `/me/:id` | `authenticateUser` | Delete the current user's rating |
| DELETE | `/user/:userId` | `authenticateUser`, `authorizeAdminOnly` | Delete all ratings of a user |
| DELETE | `/:id` | `authenticateUser`, `authorizeAdminOnly` | Delete a rating by id |
| DELETE | `/` | `authenticateUser`, `authorizeAdminOnly` | Delete all ratings (admin) |

`score` must be an integer from 1 to 10 (`MIN_RATING_SCORE`/`MAX_RATING_SCORE`),
`review` is optional. The bookmark must belong to the rated user, and a bookmark
that already has a rating returns `409`.

## Not yet implemented

- JSON export of a user's bookmarks/ratings.
- Search/browse endpoints backed by Jikan (anime/manga) or RAWG (games).
