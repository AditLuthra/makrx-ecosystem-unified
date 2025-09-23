# TypeScript Error Report and Guidance

This document lists current TypeScript errors in the repository, grouped by file, with guidance for fixing each issue. Last updated: September 13, 2025.

---

## makrx-events (apps/makrx-events)

- **Multiple type errors in 52 files (231 errors total)**
  - Errors include: property type mismatches, missing/incorrect arguments, use of unknown/any, missing properties, and more. See terminal output for full list. Address errors file by file, starting with those in `lib/qr-service.ts`, `lib/validation.ts`, and `lib/websocket-service.ts`.
  - **Guidance:**
    - For missing properties: Add required properties to objects or update type definitions.
    - For incorrect arguments: Match function signatures as defined in the type declarations.
    - For use of unknown/any: Use type guards or assertions.
    - For property type mismatches: Align types between models and usage.
    - Ensure local services are running (see `npm run dev` and docs/README) and ports align with compose (8001–8006, 3000–3005).

---

## makrx-services (apps/makrx-services)