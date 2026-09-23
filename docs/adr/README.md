# Architecture Decision Records

One line per ADR: read the file only when the task touches its area. When an ADR is added or superseded, update this index in the same change.

| ADR | Status | Read when |
|---|---|---|
| [0001](0001-serve-react-spa-from-spring-boot-as-single-deployable.md) Serve the React SPA from Spring Boot as a single deployable | Accepted | Touching build, deployment, static serving, routing, or CORS |
| [0002](0002-use-postgresql-from-v1-not-embedded-database.md) Use PostgreSQL from v1 | Superseded by 0005 | Only for history |
| [0003](0003-long-lived-jwt-no-refresh-tokens-v1.md) Long-lived JWT, no refresh tokens | Superseded by 0004 | Only for history |
| [0004](0004-use-supabase-auth-instead-of-self-issued-jwt.md) Use Supabase Auth instead of self-issued JWT | Accepted | Touching login, signup, tokens, security config, or the current user |
| [0005](0005-use-supabase-postgres-instead-of-railway-managed-postgres.md) Use Supabase Postgres | Accepted | Touching the database, connection config, migrations, or environments |
| [0006](0006-trunk-based-branching-with-short-lived-feature-branches.md) Trunk-based branching | Accepted | Creating branches or proposing commits |
| [0007](0007-write-tests-for-code-touched-going-forward.md) Write tests for code touched going forward | Accepted | Any substantive code change (almost always) |
| [0008](0008-allow-zero-amount-draft-transactions.md) Allow zero-amount Draft transactions | Accepted | Touching Transaction amount validation, Drafts, or the Dashboard |
| [0009](0009-frontend-only-demo-mode.md) Frontend-only demo mode | Accepted | Touching `/demo`, `frontend/src/demo/`, or any hook that branches on demo mode |
| [0010](0010-passbook-visual-design-system.md) "Passbook" visual design system | Accepted | Touching styling, theme tokens in `index.css`, icons, layout/nav, or the Dashboard chart |
| [0011](0011-global-month-scope-for-dashboard-and-transactions.md) Global month scope for the Dashboard and Transactions | Accepted | Touching the month picker, month filtering, `useSelectedMonth`, the Transactions list query, or pagination |
