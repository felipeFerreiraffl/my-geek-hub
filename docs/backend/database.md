# Database

PostgreSQL, accessed through Drizzle ORM. Schemas live in
`backend/src/db/drizzle/schemas/`, relationships in
`backend/src/db/drizzle/relations.ts`, and the connection/Drizzle instance in
`backend/src/config/db.ts`.

## Tables

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | text (uuid) | primary key, generated |
| `username` | text | not null |
| `email` | text | not null, unique |
| `password` | text | not null (bcrypt hash) |
| `role` | enum `roles`: `USER` \| `ADMIN` | default `USER` |
| `created_at` / `updated_at` | timestamp | auto-managed |

### `bookmarks`

| Column | Type | Notes |
|---|---|---|
| `id` | text (uuid) | primary key |
| `user_id` | text | FK → `users.id`, cascade delete |
| `external_id` | integer | id of the work in the external catalog (Jikan/RAWG) |
| `title` | text | not null |
| `image_url` | text | nullable |
| `media_type` | enum `media_type`: `ANIME` \| `MANGA` \| `GAME` | not null |
| `status` | enum `bookmark_status`: `WATCHING` \| `COMPLETED` \| `PLANNED` \| `PAUSED` \| `DROPPED` | not null |
| `created_at` / `updated_at` | timestamp | auto-managed |

Constraints: unique index on `(user_id, external_id, media_type)` — a user can't
bookmark the same work twice; index on `user_id` for lookups.

### `ratings`

| Column | Type | Notes |
|---|---|---|
| `id` | text (uuid) | primary key |
| `user_id` | text | FK → `users.id`, cascade delete |
| `bookmark_id` | text | FK → `bookmarks.id`, cascade delete, **unique** (one rating per bookmark) |
| `score` | integer | not null, CHECK `1 <= score <= 10` |
| `review` | text | nullable |
| `created_at` / `updated_at` | timestamp | auto-managed |

### `refresh_tokens`

| Column | Type | Notes |
|---|---|---|
| `id` | text (uuid) | primary key |
| `user_id` | text | FK → `users.id`, cascade delete |
| `token_hash` | text | bcrypt hash of the refresh token |
| `expires_at` | timestamp | not null |
| `created_at` | timestamp | auto-managed |

## Relationships

- `users` 1—N `bookmarks`, `ratings`, `refresh_tokens` (all cascade on user delete).
- `bookmarks` 1—1 `ratings` (a bookmark has at most one rating; deleting the
  bookmark cascades to its rating).

Full relation definitions: `backend/src/db/drizzle/relations.ts`.

## Migrations

Managed by `drizzle-kit`, configured in `backend/drizzle.config.ts`
(dialect: `postgresql`, schema: `src/db/drizzle/index.ts`, output: `drizzle/`).

```bash
npm run db:generate   # diff the schema, write a new migration under drizzle/
npm run db:migrate    # apply pending migrations
npm run db:push       # push the schema directly, skipping migration files (dev only)
npm run db:studio     # browse the database with Drizzle Studio
```

Migration files under `backend/drizzle/` are committed to version control.
