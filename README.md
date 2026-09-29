# Finance Tracker

A personal finance tracker for logging income and expenses by category, with a monthly
dashboard.

**Live demo:** https://finance-tracker-production-4cea.up.railway.app
No signup needed: logged-out visitors land on a demo that runs entirely in the browser.

## Tech stack
- **Backend:** Java 25, Spring Boot, Spring Data JPA, Spring Security (OAuth2 resource server), Flyway, Maven
- **Frontend:** React 19, Vite, Tailwind CSS 4, TanStack Query, React Router, lucide-react
- **Data & auth:** Supabase Postgres and Supabase Auth
- **Testing & CI:** JUnit 5 + Mockito, Vitest + React Testing Library, GitHub Actions
- **Hosting:** Railway (Docker)

## Architecture
- **One deployable.** The React SPA is built and bundled into the Spring Boot jar, which serves both the app and the REST API under `/api/*`. One Railway service, one URL, no CORS ([ADR 0001](docs/adr/0001-serve-react-spa-from-spring-boot-as-single-deployable.md)).
- **Supabase Auth.** The frontend signs in directly with Supabase. Spring Boot only verifies the JWT against Supabase's JWKS endpoint and holds no signing secret ([ADR 0004](docs/adr/0004-use-supabase-auth-instead-of-self-issued-jwt.md)).
- **Supabase Postgres.** Data lives in the same Supabase project as auth, with a separate project for local development. Schema changes are Flyway migrations in `src/main/resources/db/migration` ([ADR 0005](docs/adr/0005-use-supabase-postgres-instead-of-railway-managed-postgres.md)).
- **Railway** hosts only the application container. The database is not on Railway.
- **Demo mode.** `/demo` runs the real UI against browser-local state, with no backend or Supabase calls ([ADR 0009](docs/adr/0009-frontend-only-demo-mode.md)).
- **Frontend layout.** `frontend/src/features/<feature>/` holds each feature's `api/`, `components/`, `hooks/`, `pages/` and `utils/`. Shared pieces live in `frontend/src/components`, `hooks` and `utils`.

Design decisions are recorded as ADRs: see the [ADR index](docs/adr/README.md). Domain terms are defined in [CONTEXT.md](CONTEXT.md).

## Running locally

**Prerequisites:** Java 25, Node 24, and a Supabase project for local development.

**Backend** (port 8080). Set these environment variables, then run:
- `DB_URL`: the Supabase Session pooler JDBC URL
- `SUPABASE_JWKS_URI`: your project's JWKS endpoint

```
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

**Frontend** (Vite dev server, which proxies `/api` to `localhost:8080`). Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then run:

```
cd frontend
npm install
npm run dev
```

**Tests and lint**

```
./mvnw -B verify                      # backend
cd frontend && npx vitest run         # frontend
cd frontend && npm run lint
```

Backend tests don't need a live Supabase connection.
