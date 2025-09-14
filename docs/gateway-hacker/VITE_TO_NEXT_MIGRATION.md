# Gateway Hacker: Vite → Next.js Migration — Pending Only

This checklist contains only the remaining tasks to complete the migration. Finished and general guidance have been removed for clarity.

## Pending Checklist

- Client cleanup
  - [x] Delete `apps/gateway-frontend-hacker/client/` and any Vite artifacts
  - [x] Confirm no imports reference `client/**`

- SEO and metadata
  - [x] Add JSON‑LD for remaining pages where applicable (article/product/etc.) using `components/SEOStructuredData`

- TypeScript and ESLint
  - [x] Re‑enable ESLint in `next.config.mjs` (remove `eslint.ignoreDuringBuilds`), fix any issues
  - [x] Re‑enable type checking in `next.config.mjs` (remove `typescript.ignoreBuildErrors`), fix outstanding type errors
  - [x] Re‑include `server/**` in `apps/gateway-frontend-hacker/tsconfig.json` once typings are fixed

- Server code
  - [x] Decide fate of `apps/gateway-frontend-hacker/server/storage.ts` (move to `lib/` and type correctly, or remove if unused)

- Styling verification
  - [x] Verify CSS parity after token migration to `app/globals.css`; remove any obsolete styles

- Dependency pruning
  - [x] Re-check and remove any remaining unused deps in `apps/gateway-frontend-hacker/package.json`

- Final verification
  - [x] Run `next build` with lint/types enabled; resolve any SSR boundary warnings
  - [x] Smoke test key routes and forms in the app

Once these are done, the migration is complete.
