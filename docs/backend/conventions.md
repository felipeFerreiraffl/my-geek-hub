# Backend Coding Conventions

## Naming

**Files:**

- `<feature>.routes.ts` / `.controller.ts` / `.service.ts` — one triplet per feature
  under `src/api/<feature>/`.
- `<name>.middleware.ts`, `<domain>.types.ts` — descriptive, always with the layer
  suffix.
- Utilities under `src/utils/` and `src/libs/` use plain descriptive camelCase
  filenames (`logger.ts`, `messages.ts`, `serverFn.ts`, `jwt.ts`).

**Functions:**

- Controllers: `get*`, `create*`, `update*`, `delete*` (action + entity).
- Services: `find*`, `create*`, `alter*`, `delete*` (verb + entity).
- Wrappers/factories: `asyncFn`, `middlewareFn`, `createLogger`.

**Types:**

- PascalCase, inferred from Drizzle schemas: `User`, `NewUser`, `Bookmark`.
- Request body types: `<Domain>BodyReq`. Params types: `<Domain>Params`.
- Prefer literal unions over TypeScript `enum` (e.g. `"USER" | "ADMIN"`).

**Constants:** `UPPER_SNAKE_CASE`, usually declared in `src/constants/`.

**Database:** table names are lowercase plural (`users`, `bookmarks`, `refresh_tokens`
in SQL / `refreshTokens` in TS); tables are commonly imported aliased,
e.g. `import { users as usersTable } from "@/db/drizzle/index.js"`.

## Imports & exports

- Use the `@/*` path alias over relative paths; the ESM setup requires the `.js`
  extension on the import path even though the source is `.ts`
  (`import { db } from "@/config/db.js"`).
- Import order: external packages first, then internal (`@/...`) imports.
- Services are imported as a namespace and called qualified:
  `import * as UserService from "@/api/users/users.service.js"` →
  `UserService.findUserById(id)`.
- Named exports (`export const getUsers = ...`) for most things; a default export
  for the single entity a file represents (`export default app`, `export default
  userRouter`).
- No barrel files (`index.ts` re-exports) inside `src/api/`.

## Error handling

- Controllers don't throw — they call `next({ status, message? })` for expected
  failures (`400` validation, `401` auth, `404` not found, `500` unexpected).
- Async handlers are wrapped in `asyncFn(...)` so rejected promises reach
  `next(error)` automatically.
- JWT errors are matched by type from `jose`:
  `if (err instanceof errors.JWTExpired) next({ status: 401, message: "TOKEN_EXPIRED" })`.
- The single `errorHandler` middleware (registered last in `app.ts`) is the only
  place that turns an error object into an HTTP response.

## Validation

- `zod` schemas validate input — both environment variables (`src/config/dotenv.ts`)
  and request bodies (`src/middlewares/validation.middleware.ts`).
- Validation failures forward `{ status: 400 }` to the error handler.

## Logging

- Pino, via `createLogger(prefix)` in `src/utils/logger.ts`. Never use `console.*`.
- Existing instances: `logger` (general/"INFO"), `authLogger` ("AUTH"),
  `databaseLogger` ("DB"), `proxyLogger` ("PROXY").
- Development: debug level, pretty-printed. Production: warn level, structured JSON.
- Pass the relevant data object as the logger's second argument rather than
  interpolating it into the message string:
  `databaseLogger.info("User created", newUser)`.

## Function & module design

- Small, single-responsibility functions: controllers ~10–50 lines, services
  ~3–15 lines.
- Express handler signature: `(req, res, next)`, destructure what you need from
  `req.params` / `req.body` at the top of the function.
- Generic types on handlers where useful: `asyncFn<Params, ResBody, ReqBody>`.
- Services return explicit `Promise<T>` / `Promise<T | null>` types; controllers
  return `void` and respond via `res.json()` / `next()`.
- Module dependency direction is one-way: controllers depend on services and utils;
  services depend on config and types; routes depend on controllers and
  middlewares. Services never import from controllers.

## Database interactions (Drizzle)

- Model types are inferred from schemas: `InferSelectModel<typeof users>` for reads,
  `InferInsertModel<typeof users>` for writes.
- Query results are arrays even for single-row lookups — destructure:
  `const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));`
- Use `.returning()` on inserts/updates to get the affected row back.
- Filter with Drizzle operators (`eq`, etc.) rather than raw SQL where possible.

## Comments

The codebase is largely self-documenting — comments are used sparingly, only where
logic isn't obvious from names and types. There's no JSDoc/TSDoc convention here.
