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
- Domain vocabulary baseline implemented via backend enums + shared Inertia reference payload.
- Internal system reference page (`/administration/system-reference`) to verify canonical statuses/types with reusable badge previews.
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
- Wire enum-backed values into module forms/filters as CRUD screens are implemented.
- Granular permission matrix per module/action.
- Activity/audit log integration.

## Route Inventory
- `GET /` -> auth-aware redirect to `/login` or `/dashboard`
- `GET /login` -> `AuthenticatedSessionController@create` (`login`)
- `POST /login` -> `AuthenticatedSessionController@store` (`login.store`)
- `POST /logout` -> `AuthenticatedSessionController@destroy` (`logout`)
- `GET /dashboard` -> `DashboardController` (`dashboard`) [auth]
- `GET /administration` -> `ReadinessController` (`administration.readiness`) [auth + role:super-admin|admin|staff]
- `GET /administration/system-reference` -> `SystemReferenceController` (`administration.system-reference`) [auth + role:super-admin|admin|staff]
- `GET /{module}` constrained to configured modules -> `PlaceholderController` (`module.show`) [auth]

## Model Inventory
- `App\Models\User` (default Laravel user model + Spatie `HasRoles`)
- Spatie permission package models:
  - `Spatie\Permission\Models\Role`
  - `Spatie\Permission\Models\Permission`


## Enum Inventory
- `App\Enums\UserType`: `internal`, `client`
- `App\Enums\ClientStatus`: `prospect`, `active`, `onboarding`, `suspended`, `archived`
- `App\Enums\ContactType`: `primary`, `billing`, `technical`, `escalation`
- `App\Enums\AssetStatus`: `provisioning`, `online`, `degraded`, `offline`, `retired`
- `App\Enums\AssetCriticality`: `low`, `medium`, `high`, `mission_critical`
- `App\Enums\TicketStatus`: `new`, `open`, `pending_client`, `in_progress`, `resolved`, `closed`
- `App\Enums\TicketPriority`: `low`, `medium`, `high`, `urgent`
- `App\Enums\TicketMessageType`: `public_reply`, `internal_note`, `system_event`
- `App\Enums\ServiceStatus`: `operational`, `maintenance`, `degraded`, `major_outage`, `retired`
- Shared transport contract: `App\Support\DomainReferenceCatalog::all()` emits `{label, options[{value,label,badgeVariant}]}` for each domain key.

## Enum & Shared Convention Notes
- Backend is source of truth for domain vocabularies using PHP backed enums.
- Enum options are globally shared to React via Inertia `domainReferences` in `HandleInertiaRequests`.
- Frontend domain helpers are in `resources/js/lib/domain-references.js` for option lookup, label resolution, and badge variant selection.
- Reusable badge wrappers:
  - `DomainStatusBadge` for status/type classifications
  - `DomainPriorityBadge` for priority/criticality classifications

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
- `Administration/SystemReference.jsx`
- `Placeholder/Index.jsx`
- Shared shell components:
  - `app-sidebar`
  - `app-header`
  - `page-header`
  - `flash-messages`
  - `status-badge`
  - `domain-status-badge`
  - `domain-priority-badge`
  - `empty-state`
  - `data-table-shell`
