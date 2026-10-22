# Backend conventions

Explanation about the naming and the logic to create files in the backend. General conventions (language, commits, branches) are in the [global convention.md](../convention.md).

## Naming

| Case | Used for | Examples |
|---|---|---|
| `camelCase` | Functions, variables, object properties and instances. | `findBookmarkById`, `successRes`, `bookmarkRouter`, `db`, `userId` |
| `PascalCase` | Interfaces, types and namespace imports. | `BookmarkBodyReq`, `BookmarkStatus`, `UserService` |
| `snake_case` | Database objects: tables, columns, enums and indexes. | `refresh_tokens`, `user_id`, `media_type`, `bookmark_user_idx` |
| `SCREAMING_SNAKE` | Fixed values declared outside functions, env vars and enum values. | `TENRAI_API_URL`, `PROBE_TIMEOUT_MS`, `JWT_ACCESS_SECRET`, `IN_PROGRESS` |
| `camelCase` + suffix | File names. | `handleError.middleware.ts`, `rateLimit.ts`, `auth.types.ts` |

### Constants: `camelCase` or `SCREAMING_SNAKE`?

Both are `const`, the difference is what they hold:

- `SCREAMING_SNAKE` → a **fixed value** that works like a setting: a URL, a number, a message map.
- `camelCase` → an **instance** or something built in runtime: a client, a router, a list of objects.

```ts
export const TENRAI_API_URL = "https://api.tenrai.org/v1"; // fixed value
const PROBE_TIMEOUT_MS = 5000;                            // fixed value

export const db = drizzle(client, { schema });            // instance
const bookmarkRouter = Router();                          // instance
```

### Database: TypeScript vs SQL

Drizzle schemas use `camelCase` in TypeScript and `snake_case` in the database. The column name is always written explicitly:

```ts
userId: text("user_id").notNull(),
```

### Types

| Pattern | Meaning | Example |
|---|---|---|
| `<Entity>` | Row read from the database (`InferSelectModel`). | `Bookmark` |
| `New<Entity>` | Row to insert (`InferInsertModel`). | `NewBookmark` |
| `<Entity>BodyReq` | Request body. | `BookmarkBodyReq` |
| `Update<Entity>BodyReq` | Request body for updates. | `UpdateBookmarkBodyReq` |
| `<Entity>Params` | Route params. | `BookmarkParams` |

Fixed sets of values use union types (`"ADMIN" | "USER"`) instead of TypeScript `enum`.

### Functions

| Layer | Verbs | Examples |
|---|---|---|
| Service | `find`, `create`, `alter`, `delete` | `findBookmarksByUserId`, `alterRating` |
| Controller | `get`, `create`, `update`, `delete` | `getMyBookmarks`, `updateRating` |

Handlers that act on the logged user have `My`/`Me` in the name (`getMyRatings`, `updateMe`) and live under the `/me` routes.

## Files

### Folders and suffixes

Folder names are lowercase. Feature folders are plural, and every file inside starts with the folder name, followed by a suffix that tells its role:

| Suffix | Role | Example |
|---|---|---|
| `.routes.ts` | Express router. | `bookmarks.routes.ts` |
| `.controller.ts` | Request handlers. | `bookmarks.controller.ts` |
| `.service.ts` | Business logic and queries. | `bookmarks.service.ts` |
| `.proxy.ts` | Proxy factory of an external API. | `tenrai.proxy.ts` |
| `.middleware.ts` | Middlewares. | `auth.middleware.ts` |
| `.types.ts` | Types. | `db.types.ts` |
| `.d.ts` | Type declarations for libraries. | `express.d.ts` |

Files in `config/`, `constants/`, `libs/`, `utils/` and `db/drizzle/schemas/` have no suffix, only the name of what they hold (`rateLimit.ts`, `api.ts`, `jwt.ts`, `bookmarks.ts`).

### APIs

Each folder in `src/api/` has **one scope**, and the files depend on the kind of feature:

- **Feature with data** (e.g. bookmarks) → `routes`, `controller` and `service`.

  ```txt
  api/ratings/
  ├── ratings.routes.ts
  ├── ratings.controller.ts
  └── ratings.service.ts
  ```

- **Proxy** (e.g. animes) → a `proxy` per target and a `routes` per scope. No controller or service.

  ```txt
  api/proxy/tenrai/
  ├── tenrai.proxy.ts
  └── animes/
      └── animes.routes.ts
  ```

After creating the router, mount it in `app.ts` under `/api/<scope>`.

### `app.ts` and `index.ts`

| File | Content |
|---|---|
| `app.ts` | Express setup: global middlewares (`helmet`, JSON), routes and the error handler. Exports `app`. |
| `index.ts` | Server startup: connects to the database, runs the proxy probes and opens the port. Prints the server info on the console. |

A new route goes in `app.ts`. A new startup check (e.g. a new connection) goes in `index.ts`.

## Code patterns

### Imports

- Use the `@/*` alias instead of relative paths: `@/config/db.js`. Code from the root `shared/` folder uses `@shared/*`: `@shared/schemas/user.schema.js`.
- Import Zod as `import { z } from "zod"`.
- Always use the `.js` extension, even for `.ts` files (ESM requirement).
- Import services and controllers as a namespace: `import * as BookmarkService from "@/api/bookmarks/bookmarks.service.js"`.
- No barrel files (`index.ts` re-exports) inside `api/`.

### Controllers and errors

- Wrap async handlers with `asyncFn()` and sync middlewares with `middlewareFn()` (`utils/serverFn.ts`). This way, rejected promises reach the error handler.
- Controllers don't `throw`: they send errors with `next({ status })`, and `errorHandler` builds the response.
- Successful responses use `successRes(res, status, data)`.

```ts
if (!existingBookmark) {
  databaseLogger.error(`Bookmark ${id} not found`);
  return next({ status: 404 });
}

successRes(res, 200, existingBookmark);
```

### Logging

Use the loggers from `utils/logger.ts` (`logger`, `authLogger`, `databaseLogger`, `proxyLogger`) instead of `console.*`. The only exception is the startup info printed by `index.ts` and `config/`.

## Next reads

- [architecture.md](architecture.md) — how the backend is organized.
- [stack.md](stack.md) — libraries and tools of the backend.
