# 0005. Use Supabase Postgres instead of Railway-managed Postgres

## Status
Accepted — supersedes 0002

## Context
ADR0002 chose a Railway-managed Postgres instance specifically because it kept database, compute, billing, and networking under one provider.

ADR0004 adopts Supabase Auth for this project. Supabase bundles Postgres alongside Auth in the same project, and its free tier makes it easy to stand up a second, fully separate project for local development at no cost. Since Supabase is now the auth provider regardless, using its bundled Postgres avoids running a third piece of infrastructure (Railway Postgres) that would otherwise sit unrelated to the auth database.

This decision is a consequence of ADR0004, not an independent re-evaluation of Railway Postgres on its own merits — Railway's managed Postgres would also have worked and offers its own free/cheap local-dev instances. The deciding factor is co-location with Auth, not a claim that Supabase's Postgres is intrinsically better than Railway's.

## Decision
Use Supabase-hosted Postgres (via the Session pooler connection string, port 5432) for both the production project and a separate free local-dev project. Railway hosts only the Spring Boot application; it does not host the database.

## Consequences
- Auth and data now live in the same Supabase project per environment, which is simpler to reason about than auth in one vendor and data in another.
- A free, fully isolated local-dev Postgres (paired with local-dev Auth) comes as part of the same project split introduced in ADR0004, at no extra setup cost.
- Introduces a second infrastructure vendor into the deployment (Railway for compute, Supabase for data) rather than the single-vendor setup ADR0002 originally aimed for. Network latency between Railway and Supabase's Postgres is a new variable that a co-located Railway Postgres instance wouldn't have had.
- Leaving Supabase later means migrating both auth and data together, not one independently of the other.
- Two projects (prod + local-dev) to keep connection strings, pooler URLs, and credentials straight for — mitigated by keeping them in separate `.env.production` / `.env.local` files, never committed.
