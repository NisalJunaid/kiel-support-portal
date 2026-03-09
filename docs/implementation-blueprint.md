# Implementation Blueprint

## Current Architecture Decisions
- Application is a Laravel 10 monolith with Inertia.js + React rendered from `resources/js`.
- Frontend entrypoint is `resources/js/app.jsx` using `@inertiajs/react` and Vite.
- UI foundation follows shadcn/ui conventions with reusable primitives in `resources/js/Components/ui` and shared app components in `resources/js/Components/shared`.
- Tailwind CSS is configured with shadcn-style design tokens and utility helpers.

## Implemented Modules
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
  - `/administration`

## Pending Modules
- Full authentication workflows (login/logout/password reset UI and controllers).
- CRUD features for clients, contacts, client users, assets, tickets, services, reports, and administration.
- Role/permission enforcement and policies.
- Activity/audit log integration.

## Route Inventory
- `GET /` -> redirect to `/dashboard`
- `GET /dashboard` -> `DashboardController` (`dashboard`)
- `GET /{module}` constrained to configured modules -> `PlaceholderController` (`module.show`)

## Model Inventory
- `App\Models\User` (default Laravel user model)

## Permission Inventory
- No permission map implemented yet.
- Planned integration with Spatie laravel-permission once module CRUD is introduced.

## UI Page Inventory
- `Dashboard/Index.jsx`
- `Placeholder/Index.jsx`
- Shared shell components:
  - `app-sidebar`
  - `app-header`
  - `page-header`
  - `flash-messages`
  - `status-badge`
  - `empty-state`
  - `data-table-shell`
