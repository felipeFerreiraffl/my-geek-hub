---
name: doc-reviewer
description: Keeps this repo's hand-maintained docs/ tree in sync after code, architecture, or convention changes. Use this proactively as the last step of any task that added, removed, or renamed a file, changed backend routes, DB schema/migrations, env vars, layering, or coding conventions in backend/ or frontend/ — don't wait for the user to ask. Also runs on explicit /doc-reviewer invocation. Not for read-only, exploratory, or planning-only work where nothing in the working tree changed.
---

# doc-reviewer

This repo keeps hand-written docs in `docs/` that explain the architecture, conventions,
stack, database schema, API routes, and testing setup. Unlike `.planning/codebase/`
(an automated snapshot, never hand-edited), `docs/` is meant to stay accurate over time —
but nothing regenerates it automatically. If a change to the code isn't reflected back
into `docs/`, the docs quietly go stale and stop being trustworthy. That's the gap this
skill closes: after work that changes what's true about the codebase, check whether what's
written in `docs/` is still true, and fix only the parts that aren't.

The two failure modes to avoid are symmetric: leaving `docs/` stale (silently wrong), and
over-editing `docs/` (padding it with content nobody asked for, turning a two-line fact
into a paragraph, or guessing at details you're not sure of). Both make the docs less
trustworthy. Aim for the docs to say exactly what's true, as concisely as before.

## When to run this

Run at the end of a task that changed the working tree in a way that could make a
sentence in `docs/` wrong: new/removed/renamed files, new API routes, DB schema or
migration changes, new environment variables, a new or changed layering/naming/error-handling
convention, a new top-level directory, or a cross-app architectural change.

Don't run it for read-only investigation, planning, or a task that touched no files.
If a task only modified test files or internal implementation details that nothing in
`docs/` describes, there's usually nothing to do here — that's fine, say so and stop
(see Step 5).

## Step 1: Know what actually changed

Look at what the just-finished task touched — `git diff` / `git status` against the
files you edited, or your own memory of what you just did if the change hasn't been
committed. Don't rely on a vague sense of "we did something with bookmarks" — get the
concrete list of files and, for each, what changed (new file, new route, new column,
renamed pattern, etc.). You can't judge whether a doc is now wrong without knowing
precisely what happened.

## Step 2: Map the change to candidate docs

This repo's `docs/` structure is fixed and each file has a narrow job. Use this map to
shortlist which files are plausibly affected — don't open files that clearly aren't
related to the change:

| Change involves | Likely doc |
|---|---|
| New/changed Express route, request/response shape | `docs/backend/api.md` |
| New DB table, column, or migration | `docs/backend/database.md` |
| New env var, dependency, or stack choice | `docs/backend/stack.md` |
| New layering pattern, naming rule, error-handling or logging convention (backend) | `docs/backend/conventions.md` |
| Backend data flow / how routes-controller-service-db fit together | `docs/backend/architecture.md` |
| New test pattern or testing tool | `docs/backend/testing.md` |
| New top-level directory, cross-app concern, or change to how backend/frontend relate | `docs/general/architecture.md` |
| Repo-wide convention (git flow, branch naming, repo layout) | `docs/general/conventions.md` |
| Project purpose/domain/scope | `docs/general/overview.md` |
| Frontend code (routes, components, conventions) | None of the above yet — `frontend/` is an unbuilt scaffold. Don't invent frontend doc content ahead of real code; if the change is the *first* real frontend feature, flag that a frontend doc likely needs to be created and ask the user rather than drafting one from scratch. |

A single change often maps to zero, one, or two docs — not all of them. If nothing in
the map plausibly applies, that's a valid outcome (see Step 5).

## Step 3: Read before you propose anything

For every doc you shortlisted, read its current content in full before deciding
anything. Never guess at what a doc currently says or assume a section exists — you
need the actual current wording to know (a) whether it's now wrong, and (b) how to
make the smallest edit that fixes it. This also tells you the doc's existing tone,
structure, and level of detail, which your edit should match.

## Step 4: Decide whether it's actually material

Not every change is worth a doc edit. Update a doc only when, after reading it, an
existing sentence, table row, or example is now **inaccurate, missing something a
reader would need, or actively misleading** — not just "related to" the change.

Skip it when the change is internal and nothing documented describes that level of
detail (e.g. renaming a private helper, refactoring inside a function, adjusting
internal test structure). The docs describe architecture, conventions, schema, and
routes at a level a new contributor would read — not implementation detail.

When you're genuinely unsure whether a change crosses this line, that's exactly what
Step 5 is for — don't just guess in either direction (silently skip it, or silently
add it).

## Step 5: When uncertain, ask — don't guess

This is a hard requirement, not a courtesy. Stop and use `AskUserQuestion` before
writing anything to a doc whenever:

- You're not sure whether the change is significant enough to document (materiality
  is genuinely ambiguous), or
- You know a doc needs updating but you're not sure of the correct content — e.g. an
  env var's real default/required-ness, whether a new route is public or
  auth-protected, what a new convention should be called, or how a schema change
  should be phrased.

Ask a specific, answerable question (e.g. "The new `RATINGS_MAX_LENGTH` env var — is
it required or optional, and what's the default?") rather than a broad "should I
update the docs?" Batch related questions into one `AskUserQuestion` call rather than
asking one at a time.

If nothing is ambiguous — the change and the correct wording are both clear from what
you read in Steps 1–3 — proceed directly to editing; asking when there's no real
uncertainty just adds friction.

## Step 6: Edit minimally

When you do edit a doc:

- Change the smallest span of text that makes it accurate again — update the existing
  sentence, bullet, or table row in place rather than appending a new section next to
  the outdated one.
- Match the doc's existing structure, heading level, and tone. Don't restructure a doc
  as part of a docs-sync pass unless the restructure itself is what's needed to stay
  accurate.
- Don't add speculative or future-facing content ("this will eventually support..."),
  marketing language, redundant restatements of something already said elsewhere in
  the same doc, or extra examples beyond what's needed to stay accurate. If you're
  tempted to explain *why* a decision was made and the doc doesn't already do that
  for similar entries, leave it out — that's not this skill's job.
- If a doc is already reasonably sized for what it covers, prefer tightening or
  replacing text over growing it. A docs-sync edit should rarely make a file
  noticeably longer; if it does, that's a signal to double-check you haven't drifted
  into Step 5 territory (padding instead of asking).

## Step 7: Off-limits without explicit confirmation

- **Never edit `.planning/codebase/`.** It's an automated, point-in-time snapshot, not
  live documentation — editing it by hand would make it inconsistent with what
  actually regenerates it.
- **Never edit `CLAUDE.md` or `backend/CLAUDE.md` without asking first**, even if a
  structural change (new doc file, renamed layer, moved directory) makes their doc map
  or guidance stale. These are higher-stakes files that shape how every future agent
  session behaves — flag what looks stale and let the user confirm the exact wording
  via `AskUserQuestion` before touching them.

## Step 8: Report exactly what happened

End with an explicit summary, not a vague "docs look fine":

- If you edited docs: list each file changed and, in one line each, what changed and
  why (tie it back to the code change that motivated it).
- If nothing needed updating: say so explicitly and name what you checked — e.g. "Checked
  `docs/backend/api.md` and `docs/backend/database.md` against the new bookmarks route
  and migration; both already describe this correctly, no changes made."

Never leave it implicit whether docs were reviewed.
