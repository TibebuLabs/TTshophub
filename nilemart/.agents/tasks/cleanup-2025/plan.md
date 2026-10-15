# NileMart — Cleanup & Code Quality Plan

**Goal:** Make every file clear, readable, and interesting — expand dense one-liners into
well-structured multi-line code, add JSDoc where missing, remove dead code — while keeping
100 % of functionality, every exported symbol, every route, every Tailwind class, and every
data model exactly as-is.

**Execution order:** lib first (components import them), then components, then backend
(gateway controllers first, then microservices they call), then TypeScript verification last.

---

## Group 1 — Frontend: lib utilities

These four files have no dependencies on each other inside the group.
Rewrite all four before touching components.

---

### 1 · `frontend/src/lib/types.ts`

**Current issues**
- Every interface is a single-line wall of properties with no separation.
- No JSDoc on any interface or field.
- `Product.images` and `Product.featured` are used in `ProductCard.tsx` but missing from
  the interface — adding them makes the code strict-compatible.

**What to expand / add**
- Break each interface onto multiple lines (one property per line).
- Add a one-line JSDoc block above each interface (`/** … */`).
- Add the two missing optional properties to `Product`:
  `images?: string[];` and `featured?: boolean;`
  (already used in `ProductCard`, so these are missing type declarations, not new behaviour).

**What to keep unchanged**
- All seven interface names and every existing property name / type exactly as-is.
- Export signatures unchanged.

Files: `frontend/src/lib/types.ts`
Verify: `cd nilemart/frontend && npx tsc --noEmit` — no new errors.

---

### 2 · `frontend/src/lib/format.ts`

**Current issues**
- `beep()` is a dense one-liner (try/catch with 7 chained method calls inline).
- `ago()` is a one-liner with embedded ternary chain.
- The `FALLBACK` object spans one very long line.

**What to expand**
- `beep()`: expand to named variables (`ctx`, `osc`, `gain`) with one statement per line;
  keep `(window as any).webkitAudioContext` fallback; keep the `try/catch` swallowing
  AudioContext errors silently.
- `ago()`: expand to named intermediate variables (`diffMin`, `diffHour`); keep output
  strings identical.
- `FALLBACK`: break city entries to one per line.
- Add a one-line JSDoc above `beep()`, `ago()`, and `discount()`.

**What to keep unchanged**
- `etb`, `discount`, `FLOW`, `CAT_ICON`, `PAYMENTS` — structure already fine, minor spacing
  only acceptable but not required.
- All exported names and all return values.

Files: `frontend/src/lib/format.ts`
Verify: `cd nilemart/frontend && npx tsc --noEmit` — no new errors.

---

### 3 · `frontend/src/lib/store.ts`

**Current issues**
- `useAuth` is one long line with the entire state inline.
- `useNotif` is one long line.
- `useToast` closure with an outer `let t` is fine but the `show` function is a one-liner.
- `cartSubtotal` is fine.

**What to expand**
- `useAuth`: break the `create()(persist(…))` call so each state method is on its own line.
- `useCart.add`: already multi-line — minor clarity improvement only (rename `cur` → `existingQty`).
- `useToast.show`: expand to two statements: `set({ msg })` then the `clearTimeout/setTimeout`.
- `useNotif`: expand all four methods to multi-line; rename `s` → `state` in `add` and `readAll`.
- Add JSDoc above each exported store (`/** Auth state — persisted to localStorage as 'nm-auth'. */`).

**What to keep unchanged**
- Store names (`useAuth`, `useCart`, `useToast`, `useNotif`, `useHydrated`, `cartSubtotal`).
- `persist` keys (`nm-auth`, `nm-cart`).
- All state interfaces and method signatures.

Files: `frontend/src/lib/store.ts`
Verify: `cd nilemart/frontend && npx tsc --noEmit` — no new errors.

---

### 4 · `frontend/src/lib/api.ts`

**Current issues**
- The `api<T>()` function has the try/catch body, header construction, and error handling all
  on consecutive compact lines.
- No JSDoc on either export.

**What to expand**
- Expand `api<T>()`: each logical step on its own line — build headers, fetch, parse JSON,
  handle 401, handle non-ok, return data.
- Add JSDoc above `api` and `useConfig`.
- `useConfig`: already readable; minor expansion of the `useEffect` inner callback acceptable.

**What to keep unchanged**
- `API` constant.
- Function signatures, error messages, 401 auto-logout behaviour, module-level `cache` variable.

Files: `frontend/src/lib/api.ts`
Verify: `cd nilemart/frontend && npx tsc --noEmit` — no new errors.

---

## Group 2 — Frontend: components

Rewrite in dependency order: simpler/shared first, then complex composites.

---

### 5 · `frontend/src/components/Toaster.tsx`

**Current issues**
- Everything is a single JSX line with no separation.

**What to expand**
- Extract `msg` subscription to a named variable.
- Return the `<div>` on multiple lines with each Tailwind class visible.
- Keep `role="status"` accessibility attribute.

Files: `frontend/src/components/Toaster.tsx`
Verify: `cd nilemart/frontend && npx tsc --noEmit`

---

### 6 · `frontend/src/components/Footer.tsx`

**Current issues**
- Three `<div>` columns are collapsed onto a few lines inside a single return.

**What to expand**
- Break each footer column into clearly labelled JSX blocks.
- Keep all text content, `container-x` layout, `pb-24`, `md:pb-8` classes.

Files: `frontend/src/components/Footer.tsx`
Verify: `cd nilemart/frontend && npx tsc --noEmit`

---

### 7 · `frontend/src/components/BottomNav.tsx`

**Current issues**
- Minor: `p`, `h`, `count`, `admin` declared on one line; `tabs` array entry objects are
  readable but could use a typed interface.

**What to expand / clean**
- Separate declarations onto individual lines.
- Add a `NavTab` interface for the tab objects (local, not exported).
- Keep all `href`, `icon`, `label`, `badge` values and Tailwind classes unchanged.

Files: `frontend/src/components/BottomNav.tsx`
Verify: `cd nilemart/frontend && npx tsc --noEmit`

---

### 8 · `frontend/src/components/ui.tsx`

**Current issues**
- `Skeleton` and `Empty` are dense one-liners.
- `Countdown` useEffect callback is a single-line function.
- `Timeline` return JSX is a one-liner.

**What to expand**
- `Skeleton`: break into two lines (outer div + inner shimmer div).
- `Empty`: break JSX into normal multi-line.
- `Countdown` effect: extract the time-formatter to a named `tick()` function inside the
  effect; expand `[h, m, s]` map to a readable format step.
- `Timeline`: break the `FLOW.map` callback so the inner `<div>` tree is readable.
- Keep all exported names: `Modal`, `Confirm`, `Skeleton`, `Empty`, `Stat`, `StatusPill`,
  `Timeline`, `Countdown`, `Stars`.

Files: `frontend/src/components/ui.tsx`
Verify: `cd nilemart/frontend && npx tsc --noEmit`

---

### 9 · `frontend/src/components/Notifications.tsx`

**Current issues**
- `Bell` toggle handler (`toggle`) is a one-liner with an inline conditional `api` call.
- `Bell` render has the notification list map and conditional empty state all on two lines.
- `LiveNotifications` effect is compact but readable; minor expansion only.

**What to expand**
- `toggle`: expand to an explicit `if/else` block.
- Notification list `.map` callback: multi-line JSX for each notification row.
- Add a comment above `LiveNotifications` explaining the SSE lifecycle.
- Keep `/** Opens one SSE connection… */` JSDoc comment.

Files: `frontend/src/components/Notifications.tsx`
Verify: `cd nilemart/frontend && npx tsc --noEmit`

---

### 10 · `frontend/src/components/ProductCard.tsx`

**Current issues**
- Already the most expanded component in the repo — multi-line JSX, named handlers.
- `product` prop name differs from the rest of the codebase which uses `p` — this is a
  naming divergence but the task says do NOT rename exported symbols. Keep `product` prop.
- `product.images` and `product.featured` are used here; after step 1 adds them to the
  type, no `any` cast is needed.

**What to clean**
- Confirm `product.images?.[0]` and `product.featured` compile clean after types.ts update.
- Minor: extract the `imageUrl` fallback URL to a named constant inside the component.
- No structural changes — this file is already well-structured.

Files: `frontend/src/components/ProductCard.tsx`
Verify: `cd nilemart/frontend && npx tsc --noEmit`

---

### 11 · `frontend/src/components/AuthForm.tsx`

**Current issues**
- All state declarations on two lines.
- `set` helper function is a one-liner.
- Validation block in `submit()` has all `setErr` calls on consecutive guard lines — fine
  functionally but reads better as extracted functions.
- JSX has several `<>…</>` fragments with inline conditional rendering collapsed to long lines.
- The body construction ternary inside `submit` is long.

**What to expand / clean**
- Split all `useState` declarations to one per line.
- Extract a `validateRegistration()` function (returns `string | null` — the error message
  or null) so `submit` reads as: `const error = validateRegistration(); if (error) return setErr(error);`
- Break the `body` construction ternary into an explicit `const body = reg ? { … } : { … }` with
  each property on its own line.
- Break the JSX for register-only fields into named sub-blocks with line breaks between labels
  and inputs.

**What to keep unchanged**
- All form field IDs (`n`, `p`, `e`, `w`, `c`, `k`), all `autoComplete` values,
  all Tailwind classes, route redirects, `setSession` / `useToast` calls.

Files: `frontend/src/components/AuthForm.tsx`
Verify: `cd nilemart/frontend && npx tsc --noEmit`

---

### 12 · `frontend/src/components/Header.tsx`

**Current issues**
- First line of the component body declares 4 variables on one line.
- `go` and `out` are one-liners.
- The user-menu `<div>` and avatar `<button>` are very long single lines.

**What to expand / clean**
- Split variable declarations (one per line).
- Expand `go()` and `out()` to regular multi-line arrow functions.
- Break the avatar `<button>` inner JSX into indented children.
- Break the dropdown `<div>` into clearly separated header block + link list.

**What to keep unchanged**
- All `href` values, all `aria-*` attributes, all Tailwind classes,
  the `item` CSS string constant, the click-outside effect logic.

Files: `frontend/src/components/Header.tsx`
Verify: `cd nilemart/frontend && npx tsc --noEmit`

---

### 13 · `frontend/src/components/ChatBot.tsx`

**Current issues**
- `send()` function: the `orders` fetch, request build, and state update are collapsed to
  4 long lines.
- The product card inside the messages map is a one-liner.
- Chip `onClick` strips the emoji prefix with `c.replace(/^\S+\s/, '')` inline — a small
  named helper makes it self-documenting.

**What to expand / clean**
- `send()`: expand to clearly separated blocks: (a) guard clause, (b) optimistic messages
  update, (c) fetch orders, (d) POST to `/api/chat`, (e) parse and apply reply, (f) catch.
- Extract chip-text helper: `const chipText = (c: string) => c.replace(/^\S+\s/, '')`.
- Expand product card JSX inside the messages map to multi-line.
- Keep `/** "Nile" – shopping assistant … */` JSDoc.

**What to keep unchanged**
- `CHIPS` array, `Msg` interface, all API endpoints, `fmt` markdown-bold helper,
  all Tailwind classes, `aria-label` values.

Files: `frontend/src/components/ChatBot.tsx`
Verify: `cd nilemart/frontend && npx tsc --noEmit`

---

### 14 · `frontend/src/components/Shop.tsx`

**Current issues**
- Component state declarations: 8 variables on one line.
- The feature-card data array (`.map(([i, t, d]) => …)`) uses non-descriptive single-char
  destructuring.
- The `items === null ? … : items.length === 0 ? … : …` ternary in JSX is one dense line.

**What to expand / clean**
- Split all `useState` declarations to one per line.
- Extract the feature-card static data to a named `FEATURES` constant above the component
  with properly named fields (`icon`, `title`, `detail`).
- Replace the three-way inline ternary with explicit `if/else` rendered via a named
  `renderProductGrid()` helper function defined inside the component.
- Keep `SLIDES` array as-is (already readable).

**What to keep unchanged**
- All `id="shop"` anchors, all category filter logic, all Tailwind classes, the `useMemo`
  deals filter, the `useEffect` product-fetch logic.

Files: `frontend/src/components/Shop.tsx`
Verify: `cd nilemart/frontend && npx tsc --noEmit`

---

## Group 3 — Backend: API Gateway

Rewrite in dependency order: shared infrastructure first, then controllers.

---

### 15 · `backend/apps/api-gateway/src/app.module.ts`

**Current issues**
- `HealthController` is declared inline in the same file as `AppModule` with the `@Get()`
  method on one line.

**What to expand**
- Move `HealthController` declaration above `AppModule`; expand its `ok()` method body to
  multiple lines (one property per line in the returned object).
- Add a JSDoc block above `HealthController` explaining its role.
- Keep `@Module` decorator and imports list unchanged.

Files: `backend/apps/api-gateway/src/app.module.ts`
Verify: `cd nilemart/backend && npx tsc --noEmit`

---

### 16 · `backend/apps/api-gateway/src/core/core.module.ts`

**Current issues**
- `ClientsModule.register([…])` with four `tcpClient()` calls is one long line.

**What to expand**
- Break the four `tcpClient(…)` registrations to one per line.
- Add an inline comment above each client identifying which microservice it connects to.
- Keep `@Global()`, `@Module()`, all imports, exports, providers unchanged.

Files: `backend/apps/api-gateway/src/core/core.module.ts`
Verify: `cd nilemart/backend && npx tsc --noEmit`

---

### 17 · `backend/apps/api-gateway/src/core/auth.guard.ts`

**Current issues**
- `JwtAuthGuard.canActivate` is three dense lines; the token extraction from the header
  and the SSE `?token=` fallback are in an inline comment on one expression.
- `RolesGuard.canActivate` is three lines with the reflector calls collapsed.

**What to expand**
- `JwtAuthGuard.canActivate`: expand to explicit statements — extract request, extract
  header, derive token (with a comment block explaining the SSE `?token=` fallback), verify
  JWT, ensure session.
- `RolesGuard.canActivate`: expand the reflector calls and role check to clear if/return
  statements with inline comments.
- Keep `/** @Auth() = any signed-in user · @Auth('admin') = admins only */` comment.

Files: `backend/apps/api-gateway/src/core/auth.guard.ts`
Verify: `cd nilemart/backend && npx tsc --noEmit`

---

### 18 · `backend/apps/api-gateway/src/auth/auth.controller.ts`

**Current issues**
- All five route methods are one-liners with no JSDoc.

**What to expand**
- Expand each method body so it reads as a proper multi-line method.
- Add a JSDoc `/** … */` above each route method explaining what it does in one sentence.
- Keep `@Controller('auth')` and all `@Post`/`@Get`/`@Patch` decorators unchanged.

Files: `backend/apps/api-gateway/src/auth/auth.controller.ts`
Verify: `cd nilemart/backend && npx tsc --noEmit`

---

### 19 · `backend/apps/api-gateway/src/products/products.controller.ts`

**Current issues**
- All seven route methods are one-liners; the `config()` method has the JSDoc comment
  but no other methods do.

**What to expand**
- Expand each method body to multi-line.
- Add JSDoc above each route.
- Keep `@Controller()` (no prefix — routes are `/config`, `/products`, `/products/:id`)
  and the `CATEGORIES / CITIES / FREE_SHIPPING_OVER` config response unchanged.

Files: `backend/apps/api-gateway/src/products/products.controller.ts`
Verify: `cd nilemart/backend && npx tsc --noEmit`

---

### 20 · `backend/apps/api-gateway/src/orders/orders.controller.ts`

**Current issues**
- All six route methods are one-liners; no JSDoc anywhere.

**What to expand**
- Expand method bodies to multi-line.
- Add JSDoc above each route.
- Keep all `@Auth` decorator role requirements (`'customer'`, `'admin'`, none) unchanged.

Files: `backend/apps/api-gateway/src/orders/orders.controller.ts`
Verify: `cd nilemart/backend && npx tsc --noEmit`

---

### 21 · `backend/apps/api-gateway/src/users/users.controller.ts`

**Current issues**
- `list()` is already multi-line and clear.
- `update`, `suspend`, `reset`, `remove` are compact one-liners.
- No JSDoc on any method.

**What to expand**
- Add JSDoc above each route method.
- Expand the `update`/`reset`/`remove` one-liners; `suspend` already has multi-line logic.
- Keep `BadRequestException` self-suspension guards intact and identical.

Files: `backend/apps/api-gateway/src/users/users.controller.ts`
Verify: `cd nilemart/backend && npx tsc --noEmit`

---

## Group 4 — Backend: Microservices

---

### 22 · `backend/apps/auth-service/src/auth.service.ts`

**Current issues**
- `private pub()`, `private session()`, `private find()` are one-liners.
- `update()` uses three inline `if (d.x) u.x = d.x` on one line.
- `password()` and `resetPassword()` are one-liners.
- `userStats()` forEach callback is a dense one-liner.

**What to expand**
- Expand `pub`, `session`, and `find` to normal multi-line methods.
- Expand `update()`: one `if` per line.
- Expand `password()` and `resetPassword()` to clear sequential steps.
- Add JSDoc above every public method (`register`, `login`, `me`, `list`, `create`,
  `update`, `suspend`, `resetPassword`, `remove`, `profile`, `password`).
- Keep `tempPw()` helper; it's clean as-is.
- Keep `onModuleInit` seeding logic unchanged.

Files: `backend/apps/auth-service/src/auth.service.ts`
Verify: `cd nilemart/backend && npx tsc --noEmit`

---

### 23 · `backend/apps/catalog-service/src/catalog.service.ts`

**Current issues**
- `get`, `create`, `update`, `remove` are one-liners.
- `list` query-builder chain is readable but the `sorts` record and fallback destructure
  could use a comment.
- `reserve` is well-structured (already multi-line) — minor JSDoc only.

**What to expand**
- Expand `get`, `create`, `update`, `remove` to multi-line methods.
- Add JSDoc above every public method.
- Add an inline comment in `list` above the sort-strategy record explaining how sort keys
  map to SQL columns.
- Keep `reserve`/`release` logic byte-for-byte equivalent; add JSDoc above each.

Files: `backend/apps/catalog-service/src/catalog.service.ts`
Verify: `cd nilemart/backend && npx tsc --noEmit`

---

### 24 · `backend/apps/order-service/src/orders.service.ts`

**Current issues**
- `mine` and `private find` are one-liners.
- `userStats` forEach callback is collapsed.
- No JSDoc on any method.

**What to expand**
- Expand `mine`, `find`, `userStats` to multi-line.
- Add JSDoc above every public method (`create`, `mine`, `all`, `advance`, `cancel`,
  `stats`, `userStats`).
- Keep the compensation `try/catch` in `create` exactly as-is (critical correctness path).

Files: `backend/apps/order-service/src/orders.service.ts`
Verify: `cd nilemart/backend && npx tsc --noEmit`

---

### 25 · `backend/apps/notification-service/src/notifications.service.ts`

**Current issues**
- `orderCreated`, `orderCancelled`, `orderStatus`, `stockLow`, `userRegistered` are
  all one-liners.
- `markRead` is a two-liner with the update call and return collapsed.
- No JSDoc on any method.

**What to expand**
- Expand each notification event handler to a method with a JSDoc comment explaining
  which event triggers it and who receives it.
- Expand `list` and `markRead` to multi-line.
- Keep the `private push()` logic unchanged.
- Keep module-local `etb()` helper.

Files: `backend/apps/notification-service/src/notifications.service.ts`
Verify: `cd nilemart/backend && npx tsc --noEmit`

---

## Final step — TypeScript verification

### 26 · Run TypeScript checks on both projects

After all 25 rewrites are complete, run strict TypeScript checks in both workspaces to
catch any type errors introduced during the cleanup.

```
cd d:\backup-t3\Desktop\nilemart-fullstack\nilemart\backend && npx tsc --noEmit
cd d:\backup-t3\Desktop\nilemart-fullstack\nilemart\frontend && npx tsc --noEmit
```

Expected: zero errors in both. If errors surface, fix them in the relevant file before
marking the task done.

Files: any file identified by tsc output.
Verify: both commands exit with code 0 and no error output.

---

## Constraints summary (for implementer)

| Rule | Detail |
|------|--------|
| Keep all exports | Every exported name, interface, and type alias is frozen |
| Keep all routes | `@Controller`, `@Get`, `@Post`, `@Patch`, `@Delete` paths are frozen |
| Keep all DB entities | Entity class names, column names, and TypeORM decorators are frozen |
| No new `any` | Use `any` only where the original code already used it |
| No new imports | Only add an import if removing a genuine unused one |
| Keep Tailwind classes | Every CSS class in JSX is preserved verbatim |
| Keep API contracts | Request/response shapes, DTO names, and microservice CMD keys are frozen |
| Functionality | Every feature (auth, cart, orders, notifications, chat) must work exactly as before |
