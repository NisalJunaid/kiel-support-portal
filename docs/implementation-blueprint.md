# Implementation Blueprint

## Current Architecture Decisions
- Application is a Laravel 10 monolith with Inertia.js + React rendered from `resources/js`.
- Frontend entrypoint is `resources/js/app.jsx` using `@inertiajs/react` and Vite.
- UI foundation follows shadcn/ui conventions with reusable primitives in `resources/js/Components/ui` and shared app components in `resources/js/Components/shared`.
- Shared list composition now includes standardized `SectionCard`, `FilterBar`, and `RowActionsDropdown` wrappers to keep index pages visually and structurally consistent while preserving existing behavior.
- List/index UX now follows a shared operational pattern: searchable + filterable shadcn/ui control rows, reset actions, query-string-preserving Laravel pagination, and shared `ListPagination` rendering for consistent navigation across modules.
- Authentication uses Laravel session auth with Inertia login page (`/login`) and protected internal routes.
- Authorization uses Spatie `laravel-permission` + Laravel policies.
- Audit trail support is implemented via Spatie `laravel-activitylog` for client companies, contacts, client users, assets, services, and tickets, with a shared presenter for consistent timeline payloads.
- Client user identities are stored in `users` and extended through `client_user_profiles` for client-company scoped access flags.
- Asset modeling uses `asset_types` + `assets` with a constrained enum surface (status/criticality) and JSON `meta` payloads driven by a centralized type-to-field definition map (`App\Support\AssetMetaFields`).

## Implemented Modules
- Authentication flow baseline (login/logout + session regeneration).
- Roles & permissions foundation with seeded roles and baseline module permissions.
- Support bootstrap user seeding includes idempotent defaults for `admin@mail.com` (role `admin`) and `client@mail.com` (role `client-user`), with automatic role creation when permission tables are available.
- Dashboard page (`/dashboard`) now powered by live operational queries (ticket queues, overdue/awaiting-client/high-priority counts, renewal watchlists, active client count, and quick links to key modules).
- Administration readiness + system reference pages.
- **Client Companies module (full CRUD):**
  - Migration + soft-deletable model + factory.
  - Store/update form requests with server-side validation.
  - Policy-backed authorization checks.
  - Inertia controller actions for index/create/store/show/edit/update/destroy.
  - Activity logging for create/update/archive events.
  - UI pages: `Clients/Index`, `Clients/Create`, `Clients/Edit`, `Clients/Show`.
- **Client Contacts module (full CRUD + status toggle):**
  - Migration + soft-deletable `ClientContact` model and relation on `ClientCompany`.
  - Store/update form requests with validation and optional escalation metadata.
  - Policy-backed authorization checks with contacts permission set.
  - Inertia controller actions for index/create/store/show/edit/update/destroy plus activate/deactivate toggle.
  - Activity logging for create/update/deactivate/reactivate/archive events.
  - UI pages: `Contacts/Index`, `Contacts/Create`, `Contacts/Edit`, `Contacts/Show`.
  - Client detail integration: contacts section on `Clients/Show` with type/status badges and create-in-context link.
- **Client Users module (admin/staff CRUD):**
  - New `client_user_profiles` table linked to users, client companies, and optional contacts.
  - `ClientUserProfile` model with profile-level access flags and role label.
  - Policy + request validation for admin/staff lifecycle management.
  - Inertia controller actions for index/create/store/show/edit/update/destroy.
  - Automatic base role assignment to `client-user` on create/update.
  - UI pages: `ClientUsers/Index`, `ClientUsers/Create`, `ClientUsers/Edit`, `ClientUsers/Show`.
  - Client detail integration: users tab on `Clients/Show`.
- **Assets module (full CRUD + client integration):**
  - New `asset_types` and soft-deletable `assets` tables, plus `asset_ticket_links` bridge table for ticket-link readiness.
  - `AssetType` and `Asset` models with client, type, parent/child, and assigned staff relationships.
  - Store/update form requests now normalize and validate `meta` keys by asset type slug via `AssetMetaFields` (e.g., hosting account, email hosting, website, domain).
  - Asset policy + route/controller authorization checks backed by `assets.*` permissions.
  - Activity logging for create/update/archive events on assets.
  - Asset UI pages: `Assets/Index`, `Assets/Create`, `Assets/Edit`, `Assets/Show` using shadcn cards/forms/tables/tabs/badges, with type-specific metadata fields rendered dynamically for create/edit/show.
  - Client workspace integration: assets are listed inside `Clients/Show` (assets tab + stats card + add-asset entry action).

- **Services module (full CRUD + asset linking + client integration):**
  - New soft-deletable `services` table with lifecycle/SLA fields and `asset_service` pivot for many-to-many service-to-asset relationships.
  - `Service` model with enum-backed `service_type` and `status`, client ownership relation, and linked assets relation.
  - Store/update form requests with service-specific validation and client-scoped asset linkage validation.
  - Policy-backed authorization checks with dedicated `services.*` permissions.
  - Inertia controller actions for index/create/store/show/edit/update/destroy.
  - Activity logging for create/update/archive events with linked asset context.
  - UI pages: `Services/Index`, `Services/Create`, `Services/Edit`, `Services/Show` using shadcn cards/forms/tables/tabs/badges.
  - Client workspace integration: services tab and service stats/actions embedded in `Clients/Show`.



- **Notifications module (ticket event feed + in-app center):**
  - Laravel database notifications are enabled via the `notifications` table with shared Inertia props for unread count + recent items in the app shell.
  - Ticket event notifications now dispatch for ticket created, assignment updates, new public replies, and status changes.
  - New in-app notification center page (`/notifications`) supports pagination plus mark-read/mark-all-read actions.
  - Topbar bell dropdown now shows unread badge + latest notifications with direct ticket navigation.

- **SLA plans + indicators module (practical v1):**
  - New `sla_plans` table/model with response/resolution targets and optional business-hour/escalation JSON payloads.
  - Client companies and services can now reference an `sla_plan_id`; tickets can reference both `service_id` and resolved `sla_plan_id`.
  - New admin CRUD surface for SLA plans: `SlaPlans/Index`, `SlaPlans/Create`, `SlaPlans/Edit`, `SlaPlans/Show`.
  - Ticket create/update now auto-resolve SLA source order (`ticket override -> service SLA -> client SLA`) and auto-populate due dates when unset.
  - Ticket list/detail now show SLA indicators (on-track/due-soon/breached/no-deadline) and linked SLA plan context.
  - Sidebar navigation now exposes SLA plans for authorized users.

- **Activity visibility module (staff/admin audit UX):**
  - Added reusable `ActivityTimeline` shadcn-based component for readable audit events across detail pages.
  - Added central activity index page (`/activity`) with module filter + pagination for staff/admin roles.
  - Added activity sections on contact and client-user detail pages and standardized timeline rendering on client/asset/service/ticket detail views.
  - Expanded logging coverage to client user create/update/archive lifecycle actions.

- **Tickets module (full CRUD + client/asset/requester linkage):
  - New soft-deletable `tickets` table with required business fields and nullable requester/asset/assignee columns.
  - Reliable sequential ticket number generation via `ticket_sequences` row-level locking action (`GenerateTicketNumber`).
  - `Ticket` model with enum-backed status/priority casting and relationships to client, requester user/contact, linked asset, and assigned staff.
  - Store/update form requests with client-scoped validation for requester and asset linkage.
  - Policy-backed authorization checks with dedicated `tickets.*` permissions.
  - Inertia controller actions for index/create/store/show/edit/update/destroy plus workflow mutation endpoints.
  - Activity logging for create/update/archive ticket lifecycle events and operational workflow actions (assignment, status/priority transitions, resolve/close/reopen).
  - UI pages: `Tickets/Index`, `Tickets/Create`, `Tickets/Edit`, `Tickets/Show` using shadcn cards/forms/tables/badges plus in-page workflow controls and compact list-row actions.
  - Ticket conversation module: `ticket_messages` persistence with enum-backed `message_type` (`public_reply`, `internal_note`, `system_event`), staff/internal visibility controls, composer UX in `Tickets/Show`, and automatic system-event generation for key lifecycle changes.
  - Ticket attachments module: secure private-file storage on local disk with `ticket_attachments` metadata, upload flows on ticket create and message composer, server-side file validation (type/size/count), and authenticated download route bound to ticket authorization.
  - Client workspace integration: client tickets tab and create-in-context ticket action.
  - Asset workspace integration: linked ticket tab plus quick actions to create/view tickets in context.

- **Reports module (operational summaries + renewal watchlists):**
  - Added server-driven reports endpoint (`/reports`) restricted to super-admin/admin/staff roles.
  - Implemented aggregate backend queries for tickets by status/priority/client, SLA compliance summary, and renewal windows for assets/services.
  - Added `Reports/Index` Inertia page using shadcn/ui cards, tables, badges, and empty states.
  - Included lightweight export placeholder guidance card (no premature export endpoint complexity).
  - Added sidebar access control via shared `canViewReports` authorization flag.

## Pending Modules
- Password reset and profile management flows.
- Full CRUD features for settings.

## Remaining Backlog (Post-MVP Enhancements)
- Granular permission matrix expansion for non-client modules.
- SLA analytics/report export workflows and configurable notifications.
- Bulk actions for list modules (tickets/assets/services/client users) with confirmation UX.

## Route Inventory
- `GET /` -> auth-aware redirect to `/login` or `/dashboard`
- `GET /login` -> `AuthenticatedSessionController@create` (`login`)
- `POST /login` -> `AuthenticatedSessionController@store` (`login.store`)
- `POST /logout` -> `AuthenticatedSessionController@destroy` (`logout`)
- `GET /dashboard` -> `DashboardController` (`dashboard`) [auth]
- `GET /administration` -> `ReadinessController` (`administration.readiness`) [auth + role:super-admin|admin|staff]
- `GET /administration/system-reference` -> `SystemReferenceController` (`administration.system-reference`) [auth + role:super-admin|admin|staff]
- `Resource /clients` -> `ClientCompanyController` (`clients.*`) [auth + policy]
- `PATCH /contacts/{contact}/toggle-active` -> `ClientContactController@toggleActive` (`contacts.toggle-active`) [auth + policy]
- `Resource /contacts` -> `ClientContactController` (`contacts.*`) [auth + policy]
- `Resource /client-users` -> `ClientUserController` (`client-users.*`) [auth + policy]
- `Resource /assets` -> `AssetController` (`assets.*`) [auth + policy]
- `Resource /services` -> `ServiceController` (`services.*`) [auth + policy]
- `Resource /sla-plans` -> `SlaPlanController` (`sla-plans.*`) [auth + policy]
- `Resource /tickets` -> `TicketController` (`tickets.*`) [auth + policy]
- `GET /activity` -> `ActivityController@index` (`activity.index`) [auth + role:super-admin|admin|staff]
- `GET /notifications` -> `NotificationController@index` (`notifications.index`) [auth]
- `PATCH /notifications/read-all` -> `NotificationController@markAllAsRead` (`notifications.read-all`) [auth]
- `PATCH /notifications/{notification}/read` -> `NotificationController@markAsRead` (`notifications.read`) [auth]
- `POST /tickets/{ticket}/messages` -> `TicketMessageController@store` (`tickets.messages.store`) [auth + policy]
- `PATCH /tickets/{ticket}/workflow/assignment` -> `TicketWorkflowController@assign` (`tickets.workflow.assignment`) [auth + policy]
- `PATCH /tickets/{ticket}/workflow/status` -> `TicketWorkflowController@status` (`tickets.workflow.status`) [auth + policy]
- `PATCH /tickets/{ticket}/workflow/priority` -> `TicketWorkflowController@priority` (`tickets.workflow.priority`) [auth + policy]
- `POST /tickets/{ticket}/workflow/resolve` -> `TicketWorkflowController@resolve` (`tickets.workflow.resolve`) [auth + policy]
- `POST /tickets/{ticket}/workflow/close` -> `TicketWorkflowController@close` (`tickets.workflow.close`) [auth + policy]
- `POST /tickets/{ticket}/workflow/reopen` -> `TicketWorkflowController@reopen` (`tickets.workflow.reopen`) [auth + policy]
- `GET /tickets/{ticket}/attachments/{attachment}` -> `TicketAttachmentController@show` (`tickets.attachments.show`) [auth + policy]
- `GET /reports` -> `ReportsController` (`reports.index`) [auth + role:super-admin|admin|staff]
- `GET /{module}` for `settings` -> `PlaceholderController` (`module.show`) [auth]

## Model Inventory
- `App\Models\User`
- `App\Models\ClientCompany` (soft deletes, account manager relation, contacts relation, client users relation, assets relation)
- `App\Models\ClientContact` (soft deletes, belongs to client company, optional reverse link for client user profiles)
- `App\Models\ClientUserProfile` (belongs to user/client company/optional contact)
- `App\Models\AssetType` (asset categorization + optional meta)
- `App\Models\Asset` (soft deletes, belongs to client/type/parent/staff, has child assets, many-to-many services)
- `App\Models\Service` (soft deletes, belongs to client, many-to-many assets)
- `App\Models\SlaPlan` (soft deletes, belongs-to target for clients/services/tickets)
- `App\Models\Ticket` (soft deletes, belongs to client/requester/asset/assignee with status/priority enums, has many conversation messages)
- `App\Models\TicketMessage` (belongs to ticket and optional author user, enum-backed message type for public/internal/system semantics)
- `App\Models\TicketAttachment` (belongs to ticket, optional ticket message context, uploader, and private file metadata)
- `Illuminate\Notifications\DatabaseNotification` (Laravel persisted in-app notification records)
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
- Seeded contact permissions:
  - `contacts.view`
  - `contacts.create`
  - `contacts.update`
  - `contacts.delete`
- Seeded client user permissions:
  - `client-users.view`
  - `client-users.create`
  - `client-users.update`
  - `client-users.delete`
- Seeded asset permissions:
  - `assets.view`
  - `assets.create`
  - `assets.update`
  - `assets.delete`
- Seeded service permissions:
  - `services.view`
  - `services.create`
  - `services.update`
  - `services.delete`
- Seeded ticket permissions:
  - `tickets.view`
  - `tickets.create`
  - `tickets.update`
  - `tickets.delete`
- Seeded SLA plan permissions:
  - `sla-plans.view`
  - `sla-plans.create`
  - `sla-plans.update`
  - `sla-plans.delete`
- Permission assignment baseline:
  - `super-admin|admin|staff`: full client/contact/client-user/asset/service/ticket CRUD permissions
  - `support-agent`: `clients.view`
- Gate override: `super-admin` bypass in `AuthServiceProvider`.

## UI Page Inventory
- `Auth/Login.jsx`
- `Dashboard/Index.jsx` (live KPI cards + priority/awaiting-client queues + renewal watch tables + quick links)
- `Administration/Readiness.jsx`
- `Administration/SystemReference.jsx`
- `Clients/Index.jsx`
- `Clients/Create.jsx`
- `Clients/Edit.jsx`
- `Clients/Show.jsx` (account workspace tabs + contextual account actions + activity feed + assets tab integration)
- `Contacts/Index.jsx`
- `Contacts/Create.jsx`
- `Contacts/Edit.jsx`
- `Contacts/Show.jsx`
- `ClientUsers/Index.jsx`
- `ClientUsers/Create.jsx`
- `ClientUsers/Edit.jsx`
- `ClientUsers/Show.jsx`
- `Assets/Index.jsx`
- `Assets/Create.jsx`
- `Assets/Edit.jsx`
- `Assets/Show.jsx`
- `Services/Index.jsx`
- `Services/Create.jsx`
- `Services/Edit.jsx`
- `Services/Show.jsx`
- `SlaPlans/Index.jsx`
- `SlaPlans/Create.jsx`
- `SlaPlans/Edit.jsx`
- `SlaPlans/Show.jsx`
- `Activity/Index.jsx`
- `Tickets/Index.jsx`
- `Tickets/Create.jsx` (includes initial attachment upload section)
- `Tickets/Edit.jsx`
- `Notifications/Index.jsx`
- `Tickets/Show.jsx` (chronological conversation thread + public reply/internal note composer with validation feedback + attachment upload/list/download UX)
- `Clients/Index.jsx` now supports search + status/account-manager filters + pagination controls.
- `Contacts/Index.jsx` now supports search + client/type/active-state filters + pagination controls.
- `Assets/Index.jsx` now supports search + client/type/status/criticality filters + pagination controls.
- `Services/Index.jsx` now supports search + client/type/status filters + pagination controls.
- `Tickets/Index.jsx` now supports search + status/priority/assignee/client filters + pagination controls.
- `ClientUsers/Index.jsx` now uses shadcn filter controls, row action dropdowns, empty state rendering, and pagination controls consistent with other index pages.
- Shared list utility: `Components/shared/list-pagination.jsx`.
- `Reports/Index.jsx`
- `Placeholder/Index.jsx` (settings only)
- Shared shell/components:
  - `app-sidebar`
  - `app-header`
  - `page-header`
  - `flash-messages`
  - `status-badge`
  - `domain-status-badge`
  - `domain-priority-badge`
  - `empty-state`
  - `section-card`
  - `filter-bar`
  - `row-actions-dropdown`
  - `entity-summary-card`
  - `data-table-shell`
  - `ui/select`

## Client Portal v1 (Scoped Experience)
- Added client ticket submission flow in the portal with policy-backed authorization (`can_create_tickets`), server-side company scoping, and SLA-aware ticket creation plus optional attachment upload.
- Added client ticket create page (`ClientPortal/Tickets/Create`) built with shadcn/ui form controls and asset selection constrained to company-owned assets.
- Client portal ticket index now exposes a `Create ticket` action when ticket creation is enabled for the authenticated client profile.
- Added a dedicated client portal route group under `/portal/*` protected by `auth + role:client-user`.
- Added role-gated internal route group (`super-admin|admin|staff|support-agent|asset-manager`) to prevent client users from entering staff/admin modules.
- Added `/home` redirect orchestration and updated login redirect target so users land in the correct experience (`/dashboard` for internal users, `/portal/dashboard` for client users).
- Added client-aware policy behavior for tickets/assets/contacts:
  - client users can only view records scoped to their `client_user_profiles.client_company_id`
  - client users cannot update/delete tickets or create internal notes
  - asset/contact visibility for client users is controlled by profile flags
- Added a dedicated client-side portal layout (`Layouts/client-portal-layout.jsx`) with scoped nav entries for Dashboard, My Tickets, Assets, and Contacts.
- Added client-facing Inertia pages with polished shadcn/ui cards/tables/empty-states:
  - `ClientPortal/Dashboard`
  - `ClientPortal/Tickets/Index`
  - `ClientPortal/Tickets/Create`
  - `ClientPortal/Tickets/Show`
  - `ClientPortal/Assets/Index`
  - `ClientPortal/Contacts/Index`
- Internal note safety: client ticket detail only renders `public_reply` messages.
- Company scoping safety: all portal controllers query by the authenticated client user profile company id.

### New/Updated Client Portal Routes
- `GET /home` -> role-aware redirect (`home`) [auth]
- `GET /portal/dashboard` -> `ClientPortal\DashboardController` (`portal.dashboard`) [auth + role:client-user]
- `GET /portal/tickets` -> `ClientPortal\TicketController@index` (`portal.tickets.index`) [auth + role:client-user]
- `GET /portal/tickets/{ticket}` -> `ClientPortal\TicketController@show` (`portal.tickets.show`) [auth + role:client-user + policy]
- `GET /portal/tickets/create` -> `ClientPortal\TicketController@create` (`portal.tickets.create`) [auth + role:client-user + policy]
- `POST /portal/tickets` -> `ClientPortal\TicketController@store` (`portal.tickets.store`) [auth + role:client-user + policy + company scoping]
- `GET /portal/assets` -> `ClientPortal\AssetController@index` (`portal.assets.index`) [auth + role:client-user]
- `GET /portal/contacts` -> `ClientPortal\ContactController@index` (`portal.contacts.index`) [auth + role:client-user]


## Security & Access Hardening Notes (Latest Pass)
- Tightened client-contact authorization: client users now require `client_user_profiles.can_manage_contacts = true` for both `viewAny` and `view` contact policy checks.
- Client portal contacts controller now delegates authorization to `ClientContactPolicy::viewAny` instead of bespoke flag checks, keeping policy logic centralized.
- Inertia shared authorization props were expanded with explicit capability flags (`canCreateClients`, `canCreateTickets`, `canViewNotifications`, `canViewSettings`, `isStaffWorkspace`) to drive consistent UI gating.
- Staff shell hardening:
  - Sidebar now fully role/permission filters dashboard + module links and hides notifications/settings based on capability flags.
  - Header notifications menu is hidden unless the authenticated user can access notifications.
  - Staff sidebar/header are suppressed for non-staff workspaces.
- Dashboard data exposure hardening:
  - Internal dashboard controller now conditionally computes cards, queues, renewal watch sections, and quick links based on policy checks/role checks.
  - Users without module access no longer receive aggregate data for those modules.
- Added critical authorization tests covering:
  - client-user denial of staff-only routes (`/dashboard`, `/clients`, `/notifications`)
  - client contact portal access requiring `can_manage_contacts` flag.

## Automated Test Coverage Notes (Latest Pass)
- Added `tests/Feature/SupportPortalCriticalFlowsTest.php` as a practical business-flow safety net for:
  - auth gate coverage for internal workspace access
  - client company CRUD permission enforcement (`clients.create/update/delete`)
  - contact CRUD permission enforcement (`contacts.create/update/delete`)
  - client-user creation restrictions (permission checks + same-company contact validation)
  - asset CRUD permission enforcement (`assets.create/update/delete`)
  - ticket creation + company-scoped visibility in the client portal
  - internal note visibility restrictions (client portal only surfaces public replies)
  - client-scoped asset/contact/ticket data access restrictions in portal routes
- Added supporting factories to keep feature tests maintainable and expressive:
  - `ClientContactFactory`, `ClientUserProfileFactory`, `AssetTypeFactory`, `AssetFactory`, `TicketFactory`, `TicketMessageFactory`.
- Test helpers now standardize Inertia request headers and baseline role bootstrap in the new critical-flow test class to reduce per-test setup noise.
