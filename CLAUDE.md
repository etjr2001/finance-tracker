# Finance Tracker

A personal finance tracker. Spring Boot (Java 25, Maven) serves a REST API under `/api/*` plus the built React (Vite) SPA, shipped as one deployable on Railway (ADR0001). Auth and Postgres are Supabase (ADR0004, ADR0005). Flyway migrations live in `src/main/resources/db/migration`.

## Domain vocabulary (always loaded)
@CONTEXT.md

## Read when relevant (don't load these up front)
| Path | Read when |
|---|---|
| `docs/adr/README.md` | Before changing auth, data, deployment, branching, testing, or anything that might contradict a past decision. It's a one-line index; open only the ADRs that apply. |
| `docs/backlog.md` | Picking up new work, or when a change touches a known debt item. |
| `docs/sprints/` | You need the history of why something was built the way it was. |

## Working rules
- Use `CONTEXT.md` terms exactly. If a request uses a term that conflicts with it, stop and ask which is meant.
- Branches: short-lived `<type>/<short-description>` cut from `main` (ADR0006). `main` is always deployable: every merge redeploys prod.
- Any substantive logic change (new behavior, bug fix, validation) comes with tests in the same change (ADR0007). Backend: JUnit 5 + Mockito. Frontend: Vitest + React Testing Library in `frontend/test/`.
- Backend tests must not need a live Supabase connection. See `src/test/java/com/project/financetracker/README.md`.
- Git: inspect freely (`status`, `diff`, `log`). Creating or switching branches, staging, and committing need my approval. **Never push, never create or merge PRs, never use `gh api`.** I publish everything.
- Never read, print, or edit `.env*` files.
- If a change would contradict an ADR, say so and propose a new ADR instead of silently diverging.

## Commands
- Backend tests: `./mvnw -B verify`
- Frontend tests: `cd frontend && npx vitest run`. `npm test` starts watch mode. If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are unset, use the dummy values from `.github/workflows/ci.yml`.
- Frontend lint: `cd frontend && npm run lint`
- Run locally against the local-dev Supabase project (values come from `.env.local`):
  - Backend: `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev`
  - Frontend: `cd frontend && npm run dev`
