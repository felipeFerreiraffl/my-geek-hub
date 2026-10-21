# Code conventions

Explanation about the general conventions on the project, regardless of being backend or frontend scoped. Specific conventions for each app (naming, imports, error handling) live in [backend/convention.md](backend/convention.md) and `frontend/convention.md` (coming soon).

## Language

All code, comments, commits and documentation are written in **English**, even if the discussion about the work happens in another language.

## Version control

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org).

```txt
<type>(<optional scope>): <short description>
```

| Type | When to use |
|---|---|
| `feat` | New feature or behavior. |
| `fix` | Bug fix. |
| `refactor` | Code change that doesn't add a feature or fix a bug. |
| `chore` | Maintenance: folder structure, dependencies, configs. |
| `docs` | Documentation only. |

Examples:

```txt
feat: add probes for multiple API messages
chore(proxy): readjust of tenrai folder structure
docs: add documentation for the proxy API target changes
```

The scope in parentheses (`()`) is optional and names the affected area, e.g. `feat(users)`, `chore(proxy)`.

A message can have one line or more. Use a body when the title can't describe every change:

```txt
feat(animes): new functions and logic for animes routes

Implemented methods to transform Tenrai routes to unique routes for application:
- fromPrefix: transform routes for named routes for backend reading
- New routes for several routes from Tenrai

Extra: added and changed docs to mention Tenrai API methods and explanation
```

Leave a blank line between the title and the body.

### Branches

```txt
feature/* → develop → main
```

- `feature/*`: where the work happens. The name indicates the app (`backend` or `frontend`) and the scope being changed (proxy, bookmarks, api, etc), e.g. `feature/backend-proxy`.
- `develop`: receives all the code merged from `feature/*`.
- `main`: stable version, receives the code from `develop`.

## Environment and secrets

Each app has its own `.env` file, which is **never committed** to the repository (see `.gitignore`). Never put secrets (passwords, JWT secrets, API keys) directly in the code.
