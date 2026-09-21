# 0001. Serve the React SPA from Spring Boot as a single deployable

## Status
Accepted

## Context
Frontend is a React SPA (chosen to demonstrate the REST API), backend is Spring Boot. These could ship as two separate deployables (SPA on Vercel/Netlify, API on Railway) or as one (Spring Boot serves the built React static bundle).

## Decision
Single deployable: the React app is built and its static output placed under `src/main/resources/static` in the Spring Boot app. One Railway service, one URL, no CORS configuration needed. The REST API still lives under `/api/*` and can be pointed at separately later if needed.

## Consequences
- Faster to deploy and operate (one service, one pipeline) — matches the "fast as possible" goal.
- No CORS setup needed for v1.
- Frontend and backend release together; can't deploy one without the other.
- Splitting them apart later (e.g. to scale the SPA on a CDN) means reintroducing CORS and a second deploy target — a deliberate future migration, not a free option.