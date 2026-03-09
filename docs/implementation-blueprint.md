# Implementation Blueprint

## Current Architecture Decisions
- Application is a Laravel 10 monolith with Inertia.js + React rendered from `resources/js`.
- Frontend entrypoint is `resources/js/app.jsx` using `@inertiajs/react` and Vite.
- UI foundation follows shadcn/ui conventions with reusable primitives in `resources/js/Components/ui` and shared app components in `resources/js/Components/shared`.
- Tailwind CSS is configured with shadcn-style design tokens and utility helpers.
- Authentication uses Laravel session auth with Inertia login page (`/login`) and protected internal routes.
- Authorization foundation uses Spatie `laravel-permission` (roles middleware + `HasRoles` trait + policy/Gate baseline).

## Implemented Modules
- Authentication flow baseline:
  - Login page + form validation + throttling.
  - Logout action from user menu.
  - Auth middleware around internal routes.
- Roles & permissions foundation:
  - Spatie role tables/config published.
  - Role middleware aliases enabled in HTTP kernel.
  - Baseline roles seeded.
  - Super-admin bootstrap user seeded and assigned.
- Administration readiness page (`/administration`) showing:
  - current user
  - assigned roles
  - seeded role inventory
  - permission readiness note
- Authentication-aware shell foundation (sidebar + topbar + breadcrumbs + flash area).
- Dashboard page (`/dashboard`) with metric cards and a priority queue table shell.
- Placeholder module pages and navigation routes:
  - `/clients`
  - `/contacts`
  - `/assets`
  - `/tickets`
  - `/services`
  - `/reports`
  - `/settings`

## Pending Modules
- Password reset and profile management flows.
- Full CRUD features for clients, contacts, client users, assets, tickets, services, reports, and administration.
- Granular permission matrix per module/action.
- Activity/audit log integration.

## Route Inventory
- `GET /` -> auth-aware redirect to `/login` or `/dashboard`
- `GET /login` -> `AuthenticatedSessionController@create` (`login`)
- `POST /login` -> `AuthenticatedSessionController@store` (`login.store`)
- `POST /logout` -> `AuthenticatedSessionController@destroy` (`logout`)
- `GET /dashboard` -> `DashboardController` (`dashboard`) [auth]
- `GET /administration` -> `ReadinessController` (`administration.readiness`) [auth + role:super-admin|admin|staff]
- `GET /{module}` constrained to configured modules -> `PlaceholderController` (`module.show`) [auth]

## Model Inventory
- `App\Models\User` (default Laravel user model + Spatie `HasRoles`)
- Spatie permission package models:
  - `Spatie\Permission\Models\Role`
  - `Spatie\Permission\Models\Permission`

## Permission Inventory
- Seeded baseline roles:
  - `super-admin`
  - `admin`
  - `staff`
  - `support-agent`
  - `asset-manager`
  - `client-user`
- Gate override: `super-admin` bypass in `AuthServiceProvider`.
- Policy baseline:
  - `UserPolicy@viewAdminReadiness`
- Current protected administration scope:
  - only users with `super-admin|admin|staff` may access `/administration`.

## UI Page Inventory
- `Auth/Login.jsx`
- `Dashboard/Index.jsx`
- `Administration/Readiness.jsx`
- `Placeholder/Index.jsx`
- Shared shell components:
  - `app-sidebar`
  - `app-header`
  - `page-header`
  - `flash-messages`
  - `status-badge`
  - `empty-state`
  - `data-table-shell`
