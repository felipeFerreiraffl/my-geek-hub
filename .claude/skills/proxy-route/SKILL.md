---
name: proxy-route
description: Adds a new external-API scope to the backend reverse proxy (e.g. Tenrai mangas, RAWG games) following the existing Tenrai/animes pattern — startup probe in config/proxy.ts, global rate limiters from the official docs, api/proxy/<target>/<target>.proxy.ts + <scope>/<scope>.routes.ts, app.ts mount, and Zod response schemas in the root shared/ folder. Use when the user asks to proxy, integrate, or expose routes from an external API (Tenrai, Jikan, RAWG, etc.), or invokes /proxy-route.
argument-hint: <target> <scope> <docs-url> [probe display name]
---

# proxy-route

Creates a new proxied scope for an external API in `backend/`, mirroring how Tenrai
animes is built today. The reference implementation is the source of truth — read it
before writing anything, since it may have evolved since this skill was written:

- `backend/src/api/proxy/tenrai/tenrai.proxy.ts` — proxy factory for a target
- `backend/src/api/proxy/tenrai/animes/animes.routes.ts` — scope routes + path helpers
- `backend/src/config/rateLimit.ts` — global limiters per target
- `backend/src/config/proxy.ts` — dev-only startup probes
- `backend/src/constants/api.ts` — upstream base URLs
- `backend/src/app.ts` — router mounts
- `docs/backend/api.md` (Animes section) and `docs/backend/architecture.md`

All code, comments and docs are written in English. Follow `docs/backend/conventions.md`
(`@/*` alias, `.js` extensions, no barrel files, `proxyLogger` instead of `console.*`
outside `config/proxy.ts`).

## Vocabulary

- **Target** — one upstream API, identified by its base URL (Tenrai, RAWG). Owns the
  proxy factory and the rate limiters.
- **Scope** — one theme served from a target (animes, mangas, games). Owns a router
  mounted at `/api/<scope>`.

Several scopes may share one target (Tenrai → animes + mangas). They then live under
the same target folder and **share the same proxy factory and limiters**:

```
backend/src/api/proxy/
└── tenrai/
    ├── tenrai.proxy.ts
    ├── animes/animes.routes.ts
    └── mangas/mangas.routes.ts
```

## Step 0: Gather inputs — ask, don't guess

Required from the user (via arguments or `AskUserQuestion`, batched in one call):

1. **Target** name (e.g. `rawg`) and **scope** name (e.g. `games`). Scope folders and
   mount paths are plural, lowercase.
2. **Official docs URL(s)** for the API. Read them (WebFetch) — rate limits, base URL,
   auth, endpoint list and response shapes all come from here, never from memory.
3. **Probe display name** — the user picks the names to keep them consistent
   (format so far: `"<Target> ‧ <Scope>"`, e.g. `"Tenrai ‧ Animes"`). If not given,
   propose one in that format and confirm.
4. **Which upstream endpoints** to expose and under which local paths, if the docs offer
   more than the obvious set. Propose a mapping table (local path → upstream path) and
   confirm before writing routes.

Stop and ask before proceeding when:

- The API needs an **API key or other secret** (RAWG does: `?key=`). Adding an env var
  touches `config/dotenv.ts`, `constants/dotenv.ts`, `.env.example` and the docs — get
  explicit authorization and the variable name first.
- The docs don't state a rate limit, or state it ambiguously (per key vs. per IP,
  per day/month quotas).
- An existing constant in `constants/api.ts` points to a resource path instead of the
  API base (e.g. `.../api/games` instead of `.../api`) and would need changing.
- Anything would require a new dependency.

## Step 1: Probe (`config/proxy.ts`)

Add one entry to `probes` **per scope** (a target with two scopes gets two probes):

```ts
{
  name: "Tenrai ‧ Mangas",                // name chosen by the user
  target: TENRAI_API_URL,                  // constant from constants/api.ts
  routes: "/api/mangas/*",                 // local mount
  path: "/manga/1",                        // a cheap, stable, real upstream endpoint
  limits: "3 req/s ‧ 115 req/min (global)",// the LOCAL limits from Step 2
  sample: (body) => `${body.data.title} (mal_id ${body.data.mal_id})`,
},
```

- `path` must be a single cheap GET that is guaranteed to exist (a fixed id), so the
  probe reliably returns 200. Verify it against the docs, and if possible with one real
  request (`curl`) to confirm the response shape the `sample` reads.
- `sample` must read fields that **actually exist** in that endpoint's response (check
  the docs/real response), producing a short human line: a title plus its id.
- If the target needs an API key, add it to the probe `path` from the env constant —
  never hardcode it.
- `limits` mirrors the local limiter values exactly; keep the `(global)` suffix when
  limiters are keyed globally.
- Add the base URL to `constants/api.ts` as `<TARGET>_API_URL` if it isn't there.

## Step 2: Rate limiters (`config/rateLimit.ts`)

Skip this step if the target already has limiters — **reuse them** for the new scope.
Separate limiters per scope would multiply the budget the upstream actually allows.

Otherwise, add per target:

```ts
const rawgLimitOptions: Partial<Options> = {
  keyGenerator: () => "rawg",   // global: the upstream limits this server, not each client
  standardHeaders: "draft-8",
  legacyHeaders: false,
};

export const rawgPerSecondLimit = rateLimit({
  ...rawgLimitOptions,
  identifier: "rawg-per-second",
  windowMs: 1000,
  limit: 4, // official 5 req/s − 1
});
```

- One limiter **per window the official docs define** (per second, per minute, per day…),
  named `<target>Per<Window>Limit` with identifier `<target>-per-<window>`.
- Each `limit` = official limit minus a headroom of **1 to 5 requests**: use 1 for small
  windows (≤ 10 req), scale up to 5 for large ones (e.g. 4 → 3, 120 → 115).
- If the limit is per API key rather than per IP, still key globally (one server key).
- Monthly/daily quotas that a fixed window can't sensibly enforce: report them to the
  user and ask how to handle them instead of guessing.

## Step 3: Scope files (`api/proxy/<target>/`)

### `<target>.proxy.ts` (only if the target is new)

Copy the shape of `tenrai.proxy.ts`: a factory taking `(pathRewrite, options?)` that
calls `createProxyMiddleware` with `target`, `changeOrigin: true`, strips
`authorization` and `cookie`, sets `Accept: application/json`, sets
`cache-control: public, max-age=300` on 200, and merges `options` and `options.on`
last so routes can override.

Target-specific needs go in the factory, not in each route — e.g. injecting an API key
query param in `proxyReq` / via `pathRewrite`, or extra upstream headers the docs require
(User-Agent, etc.). Never forward client credentials upstream.

### `<scope>/<scope>.routes.ts`

Proxy scopes have **no controller or service** — routes go straight to the proxy
factory. Structure, as in `animes.routes.ts`:

1. Apply the target limiters first: `router.use(<target>PerSecondLimit, ...)`.
2. **Aliases** for upstream endpoints outside the scope's natural upstream path, using
   `fromPrefix(localPrefix, upstreamPrefix)`. More specific paths go before generic ones
   (`/season/upcoming` before `/season/:year/:season`).
3. Per-route overrides through `options.on` (e.g. `/random` → `cache-control: no-store`
   for non-cacheable responses).
4. A final catch-all `router.use(<target>Proxy(to<Target><Scope>Path))` mapping any other
   subpath onto the scope's upstream root, if the upstream has one.

If the scope is simple (one upstream root, no aliases), the file may be just the
limiters + catch-all. If a helper like `fromPrefix` is needed by a second scope of the
same target, move it to `api/proxy/<target>/<target>.helpers.ts` instead of duplicating
it — and ask before moving it into a generic place shared across targets.

Query strings are forwarded as-is; don't re-validate them unless the user asks.

### Mount (`app.ts`)

`app.use("/api/<scope>", <scope>Router);` next to the other proxy mounts, after the
internal feature routers and before `errorHandler`.

## Step 4: Response schemas (`shared/`)

Zod schemas describe the upstream contract. The proxy stays a **transparent stream** —
it does not parse responses. Consumers (frontend, or a backend service later) call
`.safeParse` when they need runtime validation.

Location: repo-root `shared/<target>/<scope>.schema.ts` (+ `shared/<target>/common.schema.ts`
for pieces reused across scopes of the same target, such as pagination or image sets).

- Build the schemas **completely from the official docs** for every exposed endpoint:
  item schemas, list/paginated wrappers, nested objects, enums for documented closed
  value sets. Cross-check with one real response where possible.
- Mark fields `.nullable()` / `.optional()` exactly as the docs (or a real response)
  show — upstream catalogs often return `null` for missing data.
- Objects stay non-strict (default `z.object`) so new upstream fields don't break parsing.
- Export both the schema and its type: `export const AnimeSchema = z.object(...)` and
  `export type Anime = z.infer<typeof AnimeSchema>`.
- One response wrapper per endpoint family, e.g. `AnimeResponseSchema` (`{ data }`),
  `AnimeListResponseSchema` (`{ data: [], pagination }`).

**First use of `shared/`** (the folder doesn't exist yet): this introduces a cross-app
location, which the root `CLAUDE.md` says to confirm with the maintainer. Ask before
creating it and before wiring it into either app. Points to raise in that question:

- `zod` must resolve from `shared/` (no `node_modules` there): options are a minimal
  `shared/package.json` with `zod`, or each app aliasing it — pick with the user.
- Backend `tsconfig.json` has `rootDir: ./src`, so importing `../shared` breaks `tsc`;
  the backend only needs this once a service imports a schema.
- Frontend (Next.js) needs a `@shared/*` path alias and may need its bundler to allow
  files outside the project root.

Once wired, later runs just add files under `shared/<target>/`.

## Step 5: Verify

From `backend/`:

1. `npx tsc --noEmit` — must pass.
2. `npm run dev` (needs `.env`) and check the `[PROXY INFOS]` block shows the new probe
   as `✓ ... 200` with a sensible `Sample` line.
3. `curl` one aliased route and the catch-all through `http://localhost:<PORT>/api/<scope>/...`;
   confirm the `RateLimit` headers and the expected `Cache-Control`.

If you can't run something (no `.env`, no network), say so in the report rather than
claiming it works.

## Step 6: Docs

Run the `doc-reviewer` skill. Expect at least:

- `docs/backend/api.md` — a `## <Scope> (/api/<scope>)` section in the Animes style:
  upstream + auth note, alias table (method · local path · upstream endpoint · description),
  limiter values vs. official limits, stripped headers. Update "Not yet implemented".
- `docs/backend/architecture.md` / `docs/general/architecture.md` — the External API
  proxy row and integration status.
- `docs/backend/stack.md` — any new env var.

## Report

End with: files created/changed, the local → upstream route table, local vs. official
rate limits, probe result (or why it wasn't run), and any open question left for the user.
