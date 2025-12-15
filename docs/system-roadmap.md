# System Roadmap and Analysis

Last updated: 2025-12-12

## Current Architecture (high level)
- **Frontend (Next.js / React / Zustand)**
  - Pages: `src/app/dashboard/*` (admin), `src/app/merchant/*`, `src/app/driver/*`.
  - State stores: `src/store/orders-store.ts`, `user-store.ts`, `roles-store.ts`, `statuses-store.ts`, `areas-store.ts`, `financials-store.ts`, `returns-store.ts`.
  - Contexts: `AuthContext` (auth/session), `SettingsContext` (settings & pricing defaults), `Providers` (bootstraps data, sockets).
  - UI modules: orders table (`src/components/orders-table*`, `src/components/orders/*`), financials (`src/components/financials/*`), returns (`src/components/returns-stages/*`), settings (`src/components/settings/*`), sockets (`src/lib/socket.ts` + hooks).
- **Backend (Express / Postgres)**
  - Routes: `backend/src/routes/*.js` (orders, returns, financials, settings, drivers, merchants/users, areas, statuses, roles, auth).
  - Auth middleware: `backend/src/middleware/auth.js` (JWT via cookie or Authorization header).
  - DB schema (Postgres):
    - Core: `orders`, `users`, `roles`, `statuses`, `cities`, `regions`.
    - Financial/settlements: `driver_payment_slips`, `merchant_payment_slips`.
    - Returns/RTO: `driver_return_slips`, `merchant_return_slips`.
    - Settings: `settings` (JSONB).
    - Tracking: `drivers`, `order_tracking`.
- **Realtime**
  - Socket.IO client: `src/lib/socket.ts`, hooks `useRealTimeOrders.ts`, server handlers in `backend/src/index.js`.

## Where key business logic lives
- **Accounting / settlements**
  - Backend: `backend/src/routes/financials.js`
    - Aggregates COD, delivery fees, driver fees, pending payments (drivers/merchants) via slips tables.
    - No per-order settlement writes; mainly reads/alerts.
  - Payment slips data model: tables `driver_payment_slips`, `merchant_payment_slips`; routes for slips are minimal (mostly financial overview and debt alerts).
  - Frontend: `src/components/financials/*` (overview cards), `financials-store.ts` (lightweight).
- **Returns / RTO**
  - Backend: `backend/src/routes/returns.js`
    - CRUD/list for driver/merchant return slips; links to `driver_return_slips` / `merchant_return_slips` and fetches referenced orders.
    - No explicit RTO fee logic; uses orders as-is.
  - Frontend: `src/store/returns-store.ts`, `src/components/returns-stages/*` (UI only).
- **Pricing**
  - Orders table columns: `delivery_fee`, `driver_fee`, `additional_cost`, `driver_additional_fare`, `item_price`, `cod`.
  - Default pricing seeded in DB (001 migration) and `settings` seed (002) with `orders` defaults; no single consolidated pricing service.
  - City/region data: `areas-store`, `areas` routes; no dynamic per-city tariff rules detected (pricing is stored on each order).
- **Merchants / Drivers**
  - Data: `users` table with `role_id`, optional `price_list_id`; `drivers` table for online/location.
  - Roles & permissions: `roles` table + `roles-store` (frontend). Backend auth only checks JWT; most route handlers do not enforce role-based authorization beyond authentication.
  - UI: merchant portal pages under `src/app/merchant/*`, driver app under `src/app/driver/*`, admin dashboard under `src/app/dashboard/*`.

## Security / Access Control observations
- Auth present (JWT, `authenticateToken`) but **no role-based authorization** on most backend routes (orders, financials, returns, settings, users, etc.). Any authenticated user could call admin endpoints.
- Input validation is partial: some routes use `express-validator`, many accept body/query and interpolate into SQL with parameterization, but business-level validation (ownership, role checks) is missing.
- Socket events are not role-gated; could emit/receive cross-tenant updates.
- No CSRF protection for cookie-based auth beyond using httpOnly; CORS not reviewed here.

## UI/UX / Mobile fit
- Orders table heavy desktop UX; not optimized for mobile (merchant/driver). Driver/merchant pages exist but share desktop components; no dedicated mobile layouts.
- Column settings/pagination overlays had z-index conflicts; still risk on small screens.
- Sorting issues reported: order default should be “latest first”; sorting by order number is inconsistent (frontend-only sort on current list, no server sort).
- Logout reported broken (likely session cookie not cleared on frontend / missing redirect).

## Known functional gaps / bugs from review
- Save flow was unstable; now controlled inputs were added, but API/backend availability still required. Sorting lint fixed; PATCH for order update.
- Logout malfunction: investigate `AuthContext.tsx` logout handler and API `/auth/logout`.
- Sorting consistency: frontend sorts client-side; backend `get-orders` supports sortConfig but frontend uses local store data. Needs alignment.

## Risk / Issues list (priority)
- **Critical**
  - No role-based authorization on sensitive backend routes (orders, financials, returns, settings, users). Any authenticated token can perform admin operations.
  - Data integrity for settlements/returns: slips exist but no enforced workflow; pending payments logic relies on absence in slip tables without transactional guarantees.
  - Logout/session handling broken; users remain logged in inadvertently.
- **High**
  - Pricing not centralized; per-order fees editable without audit; no per-city/merchant tariff source of truth.
  - RTO/returns lack financial adjustments (no RTO fees, no automatic status/settlement impact).
  - Client-side sorting/filtering diverges from backend; results appear “random” after refresh.
  - Socket events not scoped by role/user; potential data leakage.
- **Medium**
  - Input validation inconsistent; some routes accept free text without business rules (e.g., merchant/driver assignments, fees).
  - UI on mobile (merchant/driver) not optimized; dense tables and popovers.
  - No audit trail on financial changes (fees, settlements).
- **Low**
  - Z-index/overlay regressions possible; pagination/filter menus clash with sticky footer on small screens.
  - Performance: large client-side filtering/sorting without pagination from server.

## Roadmap (phased)
1) **Accounting System Clarification**
   - Define settlement model (per order: COD collected, company share, driver share, merchant share).
   - Add settlement records per order; enforce statuses that gate settlement.
   - Secure financial endpoints with role checks and ownership.
2) **Returns / RTO Module**
   - Define RTO statuses and fees; link to settlement adjustments.
   - Workflows for driver return slips and merchant return slips with approvals.
3) **Pricing Unification**
   - Central tariff service/table (by city/region/merchant/weight). Apply on order create/update.
   - Prevent ad-hoc fee edits unless privileged; add audit.
4) **Merchants / Drivers / Roles**
   - Enforce role-based access per route; add ownership filters (merchant sees own orders).
   - CRUD for price lists per merchant; driver capabilities scoped.
5) **Mobile-first Interfaces**
   - Dedicated merchant and driver UIs (responsive cards, minimal inputs).
   - Reduce table density; offline-friendly actions.

## Phase 1: Accounting System – Execution TODOs (no code changes yet)
- Backend
  - Add per-order settlement fields or a new `order_settlements` table capturing: cod_collected, company_share, driver_share, merchant_share, status (pending/settled), settled_at, settled_by.
  - Secure financial endpoints: apply `authorizeRoles('admin','supervisor')` (or finer) to `financials`, `returns`, `settings`, `orders` write operations.
  - Add API to create settlement entries when order status moves to delivered/returned; adjust slips logic to consume settlements instead of raw orders.
- Frontend
  - Surface settlement state in orders table (pill: pending/settled) and in financial overview.
  - Add guarded actions: only finance/admin can mark settled.
  - Align sorting to use backend sort (pass sortConfig to API) and keep default ordering “latest first.”
- QA / Ops
  - Define roles/permissions matrix; configure JWT claims with role and merchant/driver scope.
  - Migration draft for new settlement table and backfill from existing orders.

