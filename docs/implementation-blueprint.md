# Implementation Blueprint

## Current Architecture Decisions
- Application is a Laravel 10 monolith with Inertia.js + React rendered from `resources/js`.
- Frontend entrypoint is `resources/js/app.jsx` using `@inertiajs/react` and Vite.
- UI foundation follows shadcn/ui conventions with reusable primitives in `resources/js/Components/ui` and shared app components in `resources/js/Components/shared`.
- Authentication uses Laravel session auth with Inertia login page (`/login`) and protected internal routes.
- Authorization uses Spatie `laravel-permission` + Laravel policies.
- Audit trail support is implemented via Spatie `laravel-activitylog` for critical client-company mutations.

## Implemented Modules
- Authentication flow baseline (login/logout + session regeneration).
- Roles & permissions foundation with seeded roles and baseline module permissions.
- Dashboard page (`/dashboard`) with summary cards and queue shell.
- Administration readiness + system reference pages.
- **Client Companies module (full CRUD):**
  - Migration + soft-deletable model + factory.
  - Store/update form requests with server-side validation.
  - Policy-backed authorization checks.
  - Inertia controller actions for index/create/store/show/edit/update/destroy.
  - Activity logging for create/update/archive events.
  - UI pages:
    - `Clients/Index` searchable table, status badge, account manager column, dropdown row actions, empty state.
    - `Clients/Create` form with validation feedback.
    - `Clients/Edit` form with validation feedback.
    - `Clients/Show` overview cards/sections.
  - Sidebar navigation visibility tied to `clients.view` authorization.

## Pending Modules
- Password reset and profile management flows.
- Full CRUD features for contacts, client users, assets, tickets, services, reports, and settings.
- Pagination controls component polish for larger datasets.
- Granular permission matrix expansion for non-client modules.

## Route Inventory
- `GET /` -> auth-aware redirect to `/login` or `/dashboard`
- `GET /login` -> `AuthenticatedSessionController@create` (`login`)
- `POST /login` -> `AuthenticatedSessionController@store` (`login.store`)
- `POST /logout` -> `AuthenticatedSessionController@destroy` (`logout`)
- `GET /dashboard` -> `DashboardController` (`dashboard`) [auth]
- `GET /administration` -> `ReadinessController` (`administration.readiness`) [auth + role:super-admin|admin|staff]
- `GET /administration/system-reference` -> `SystemReferenceController` (`administration.system-reference`) [auth + role:super-admin|admin|staff]
- `Resource /clients` -> `ClientCompanyController` (`clients.*`) [auth + policy]
- `GET /{module}` for `contacts|assets|tickets|services|reports|settings` -> `PlaceholderController` (`module.show`) [auth]

## Model Inventory
- `App\Models\User`
- `App\Models\ClientCompany` (soft deletes, account manager relation)
- Spatie permission models:
  - `Spatie\Permission\Models\Role`
  - `Spatie\Permission\Models\Permission`

## Permission Inventory
- Seeded roles:
  - `super-admin`
  - `admin`
  - `staff`
  - `support-agent`
  - `asset-manager`
  - `client-user`
- Seeded client permissions:
  - `clients.view`
  - `clients.create`
  - `clients.update`
  - `clients.delete`
- Permission assignment baseline:
  - `super-admin|admin|staff`: full client CRUD permissions
  - `support-agent`: `clients.view`
- Gate override: `super-admin` bypass in `AuthServiceProvider`.

## UI Page Inventory
- `Auth/Login.jsx`
- `Dashboard/Index.jsx`
- `Administration/Readiness.jsx`
- `Administration/SystemReference.jsx`
- `Clients/Index.jsx`
- `Clients/Create.jsx`
- `Clients/Edit.jsx`
- `Clients/Show.jsx`
- `Placeholder/Index.jsx`
- Shared shell/components:
  - `app-sidebar`
  - `app-header`
  - `page-header`
  - `flash-messages`
  - `status-badge`
  - `domain-status-badge`
  - `domain-priority-badge`
  - `empty-state`
  - `data-table-shell`
