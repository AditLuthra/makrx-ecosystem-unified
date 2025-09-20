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

- **src/app/3d-printing/page.tsx**
  - Property 'file_url' is missing in object literal for `createOrder`. Add `file_url` property.
- **src/app/admin/feature-flags/page.tsx**
  - `onUpdate` prop type mismatch. Update function signature to match expected type.
- **src/app/laser-engraving/page.tsx**
  - Unknown property 'dimensions_x'. Use 'dimensions' instead.
- **src/app/provider-dashboard/page.tsx**
  - Property 'title' does not exist on type for SVG component. Remove or update prop.
- **src/lib/api.ts**
  - Use of 'unknown' type for `storeOrder`. Add type assertion or proper type.
  - Property 'store_order_id' does not exist on type. Update type or object structure.
- **src/lib/features/client.ts**
  - Iteration over `this.cache.keys()` requires `--downlevelIteration` or ES2015+. Update tsconfig or refactor code.
- **src/lib/features/components.tsx**
  - Type mismatch in `EXPERIMENTAL_FEATURES.includes(feature)`. Ensure only valid feature keys are used.

---

## makrx-store (apps/makrx-store)

- **src/app/(catalog)/c/[...slug]/page.tsx**
  - Cannot find name 'categoryData'. Use 'categoryPath' or correct variable.
- **src/app/(product)/p/[slug]/page.tsx**
  - Multiple type mismatches for Product, SetStateAction, and prop types. Align all Product types and ensure all required properties are present.
  - 'error' is of type 'unknown'. Use type guard or String(error).
  - Type 'boolean | null' is not assignable to type 'boolean'. Provide default value.
  - 'product.variants.length' is possibly 'undefined'. Add check for variants.
- **src/app/3d-printing/enhanced-page.tsx**
  - Type mismatch in setState function. Ensure returned array matches expected type.
  - Property 'area_mm2' does not exist on type 'Upload'. Add property or adjust type.
  - Type 'string | undefined' is not assignable to type 'string'. Provide fallback value.
  - Incorrect argument count in function call. Match function signature.
- **src/app/3d-printing/page.tsx**
  - Missing properties in object literal. Add all required properties.
  - Cannot find name 'SUPPORTED_FORMATS'. Use 'SUPPORTED_3D_FORMATS'.
  - Cannot find name 'MATERIALS'. Define or import constant.
  - Type 'boolean | undefined' is not assignable to type 'boolean'. Provide default value.
- **src/app/account/payment-methods/page.tsx, src/app/account/saved-carts/page.tsx, src/app/account/wishlist/page.tsx**
  - addNotification expects 1 argument, but 2 provided. Update calls to match function signature.
- **src/app/admin/manage/page.tsx**
  - Type mismatches for filter and shippingClass. Align types with expected values.
  - Unintentional type comparisons. Ensure compared types are compatible.
- **src/components/FrequentlyBoughtTogether.tsx**
  - Set<number> used where Set<string> expected. Convert numbers to strings or update types.
  - Type mismatch in props. Ensure prop types match component expectations.
- **src/components/SmartSearch.tsx**
  - Type 'number' is not assignable to type 'string'. Convert IDs to strings.
- **src/components/layout/Header.tsx**
  - Type mismatches for category id and key assignments. Convert IDs to expected type.
  - Type 'AdminCategory' is not assignable to type 'Key | ReactNode'. Use unique string/number for keys and valid ReactNode for children.
- **src/contexts/NotificationContext.tsx, src/hooks/useRealTimeUpdates.ts**
  - Property 'id' does not exist on type 'User'. Add property to User type or adjust usage.
- **src/lib/auth.ts**
  - Cannot find name 'redirectToSSO'. Define or import function.

---

## General Guidance

- Align all type definitions between API, mock, and data models.
- Use type assertions or guards when dealing with 'unknown' or 'any'.
- Always check for undefined/null before accessing properties.
- Ensure all required props are passed to components.
- Update function calls to match their signatures.
- Use consistent naming and import conventions for constants and types.
- For iteration errors, update tsconfig target or refactor code to avoid downlevel iteration issues.

---

This document should be updated as errors are fixed or new ones are found. Address the most critical errors (those that block builds or break core features) first. For environment setup and service ports, see `docs/README.md` and `docs/REPOSITORY_OVERVIEW.md`.

---

## src/app/(product)/p/[slug]/page.tsx

- **Type mismatches for Product and SetStateAction**
  - Ensure the `Product` type used matches the expected type in state and props. Align imports and definitions.
- **Type incompatibility between API Product and mock/data Product**
  - Unify or map types between API and mock/data models.
- **'error' is of type 'unknown'**
  - Use `error instanceof Error` or `String(error)` for safe access.
- **Type 'boolean | null' is not assignable to type 'boolean'**
  - Provide a default value or use a non-null assertion.
- **'product.variants.length' is possibly 'undefined'**
  - Add a check for `product.variants` before accessing `.length`.
- **Type 'Product' is missing required properties**
  - Ensure all required properties are present when passing objects as props.

## src/app/3d-printing/enhanced-page.tsx

- **Type mismatch in setState function**
  - Ensure returned array matches the expected type.
- **Property 'area_mm2' does not exist on type 'Upload'**
  - Add the property or adjust the type.
- **Type 'string | undefined' is not assignable to type 'string'**
  - Provide a fallback value.
- **Argument of type is not assignable to SetStateAction**
  - Ensure the object matches the expected type.
- **Incorrect argument count in function call**
  - Match the function signature.

## src/app/3d-printing/page.tsx

- **Missing properties in object literal**
  - Add all required properties to objects.
- **Cannot find name 'SUPPORTED_FORMATS'**
  - Use the correct constant name, e.g., `SUPPORTED_3D_FORMATS`.
- **Cannot find name 'MATERIALS'**
  - Define or import the constant.
- **Type 'boolean | undefined' is not assignable to type 'boolean'**
  - Provide a default value.

## src/app/account/payment-methods/page.tsx, src/app/account/saved-carts/page.tsx, src/app/account/wishlist/page.tsx

- **addNotification expects 1 argument, but 2 provided**
  - Update calls to match the function signature.

## src/app/admin/manage/page.tsx

- **Type mismatches for filter and shippingClass**
  - Align types with expected values.
- **Unintentional type comparisons**
  - Ensure compared types are compatible.

## src/components/FrequentlyBoughtTogether.tsx

- **Set<number> used where Set<string> expected**
  - Convert numbers to strings or update types.
- **Type mismatch in props**
  - Ensure prop types match component expectations.

## src/components/SmartSearch.tsx

- **Type 'number' is not assignable to type 'string'**
  - Convert IDs to strings.

## src/components/layout/Header.tsx

- **Type mismatches for category id and key assignments**
  - Convert IDs to the expected type.
- **Type 'AdminCategory' is not assignable to type 'Key | ReactNode'**
  - Use a unique string or number for keys and valid ReactNode for children.

## src/contexts/NotificationContext.tsx, src/hooks/useRealTimeUpdates.ts

- **Property 'id' does not exist on type 'User'**
  - Add the property to the User type or adjust usage.

## src/lib/auth.ts

- **Cannot find name 'redirectToSSO'**
  - Define or import the function.

---

## General Guidance

- Align all type definitions between API, mock, and data models.
- Use type assertions or guards when dealing with 'unknown' or 'any'.
- Always check for undefined/null before accessing properties.
- Ensure all required props are passed to components.
- Update function calls to match their signatures.
- Use consistent naming and import conventions for constants and types.

---

This document should be updated as errors are fixed or new ones are found. Address the most critical errors (those that block builds or break core features) first.
