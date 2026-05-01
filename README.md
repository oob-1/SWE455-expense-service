# Expense Tracker · Expense Service

Personal-expense CRUD microservice. JWT-protected; per-user data isolation
enforced at the SQL layer. Stateless Node.js + Express, deployed to Cloud Run.

## Endpoints
- `POST   /expenses`      — create
- `GET    /expenses`      — list (filters: `from`, `to`, `category`, `limit`, `offset`)
- `GET    /expenses/:id`  — read one
- `PATCH  /expenses/:id`  — partial update
- `DELETE /expenses/:id`  — delete
- `GET    /health`        — liveness probe

## Local development

Same pattern as `user-manager` — see `expense-tracker-infra/docker-compose.yml`
for a one-command local stack.

```bash
cp .env.example .env
npm install
npm run migrate            # requires the user-manager migration to have run first
npm run dev
```

## JWT contract

Tokens are issued by `expense-tracker-user-manager` (HS256, `iss=user-manager`).
This service shares the same `JWT_SECRET` from Secret Manager, verifies tokens,
and uses `jwt.sub` as the authoritative user id — never trusts client-supplied
ids.

## Configuration (env vars)

| Variable | Required | Notes |
|---|---|---|
| `PORT`             | no  | default 8080 |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` | yes | PostgreSQL connection |
| `DB_PASSWORD`      | yes | locally from `.env`, in prod from Secret Manager |
| `CLOUD_SQL_INSTANCE_CONNECTION_NAME` | prod-only | enables Cloud SQL connector |
| `JWT_SECRET`       | yes | shared with user-manager |
| `LOG_LEVEL`        | no  | default `info` |

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which uses GitHub
OIDC → GCP Workload Identity Federation, builds the image, pushes it to
Artifact Registry, and rolls a new Cloud Run revision.
