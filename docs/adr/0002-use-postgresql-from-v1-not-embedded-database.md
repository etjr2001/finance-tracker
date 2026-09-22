# 0002. Use PostgreSQL from v1, not an embedded database

## Status
Superseded by 0005

## Context
Fastest local setup would be H2 (zero config, file-based). But the app is going to be deployed and used as a real online product, not just demoed locally, and most PaaS hosts (Railway included) offer a managed Postgres instance for free at hobby scale.

## Decision
Use PostgreSQL from the first commit, via Spring Data JPA, using a Railway-managed instance in production and a local Postgres (or Docker container) in dev.

## Consequences
- Slightly more setup than H2 on day one (a running Postgres instance locally).
- Avoids a data-layer migration later — schema, JPA dialect quirks, and query behavior are correct from the start.
- Ties local dev to having Postgres available (Docker Compose will handle this).