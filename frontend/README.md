# Finance Tracker — frontend

React + Vite SPA. See the [top-level README](../README.md) for the full stack and how to
run the app, and [CONTEXT.md](../CONTEXT.md) for domain terms.

## Layout
`src/features/<feature>/` holds each feature's own `api/`, `components/`, `hooks/`,
`pages/` and `utils/` (e.g. `features/categories/utils/categorySwatch.js`,
`features/transactions/components/TransactionForm.jsx`). Code shared across features
lives in top-level `components/`, `hooks/` and `utils/` (e.g. `utils/date.js`).

## Commands
```
npm run dev      # Vite dev server, proxies /api to localhost:8080
npm run build
npm run lint      # oxlint
npx vitest run    # tests once
npm test          # tests in watch mode
```

`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` must be set (dummy values are fine for
tests — see `.github/workflows/ci.yml`).
