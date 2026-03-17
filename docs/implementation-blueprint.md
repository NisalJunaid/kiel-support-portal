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
- Staff layout shell components (`AppHeader`, `AppSidebar`, and `FlashMessages`) are now Inertia-agnostic/presentational and receive page props from `AppLayout`, preventing `usePage()` calls from leaking into shared components that can render outside Inertia context.
- Tickets index row click now opens a true viewport-level right-side sheet (Radix drawer) that slides over the app with focus trap, body scroll lock, and themed overlay layering.
- Tickets index `Create ticket` action is drawer-first: it opens the shared right-side create drawer with the full `TicketForm`, keeps Inertia validation/upload behavior intact in-place, and on success closes the drawer then refreshes/open-loads the newly created ticket in the detail drawer.
- `TicketController::formData()` is the canonical data contract for `TicketForm` across drawer and standalone create/edit contexts, and now always includes: `clients`, `contacts`, `assets`, `services`, `slaPlans`, `clientUsers`, `staff`, `defaults`, `defaultClientId`, `defaultAssetId`, and `defaultServiceId`.
- Ticket detail UI is centralized in `Pages/Tickets/Partials/TicketDetailWorkspace.jsx` and reused by both `Tickets/Show` and the tickets index drawer to avoid divergent implementations.
- Ticket detail UX now prioritizes the submitted description via a shared `TicketInitialRequestCard` block near the top of both staff and client workspaces, while preserving existing conversation/thread and workflow endpoints.
- Client portal tickets index now supports staff-like filtering (`search`, `status`, `priority`) through the existing `/portal/tickets` query flow while keeping strict client-company scoping.
- Client portal tickets index is now drawer-first like staff tickets: row click opens a right-side detail sheet (`drawer_ticket` query contract) and create ticket uses the shared `EntityCreateDrawer` flow while preserving standalone `/portal/tickets/create` and `/portal/tickets/{ticket}` routes for direct navigation.
- Client portal ticket UI now reuses shared ticket workspace/form patterns (`ClientTicketWorkspace`, `ClientTicketForm`, shared ticket thread/reply/attachment components, and shadcn Sheet/Drawer primitives) to align with staff-side interaction quality without exposing internal-note controls.
- Client portal ticket create fields are normalized to typed controls with placeholders and prepopulated selects (category via shared `TICKET_CATEGORY_OPTIONS`, priority via `domainReferences`, asset via controller-provided scoped options) while keeping existing backend validation/policy rules unchanged.
- Ticket conversation experience now uses shared chat-style building blocks (`resources/js/Components/tickets/*`) for staff and client portal threads, including reusable bubbles, system event rows, attachment blocks, and reply composer UI with attachment selection/removal while preserving existing message endpoints.
- Client portal ticket payloads and routes now include ticket attachment download URLs for both ticket-level and message-level attachments through the shared `TicketAttachmentController@show` flow under the portal prefix.
- Tickets index row actions are now workflow-first quick actions (assign/status/priority/resolve/close/reopen), while the right-side drawer serves as the primary full detail + edit workspace wired directly to ticket workflow endpoints.
- Branding settings now use a normalized schema (`app_name`, `light_logo_path`, `dark_logo_path`, `light_logo_url`, `dark_logo_url`, compatibility `logo_path`/`logo_url`, `primary_color`, `secondary_color`, `accent_color`, `card_border_color`, `dark_mode_enabled`) persisted in `app_settings`; legacy `logo_path` and `border_color`/`surface_border_color` values are auto-migrated at read time for backward compatibility.
- Theme propagation is token-first and app-wide: `ThemeBridge` applies computed branding tokens on `document.documentElement` for both light and dark modes (`background`, `card`, `popover`, `muted`, `border`, `input`, `primary`, `secondary`, `accent`, and foreground pairs), so shadcn + Radix portal surfaces inherit the same persisted branding across all Inertia pages.
- Form control surfaces are standardized through shared shadcn primitives (`Input`, `Textarea`, and `SelectTrigger`) using `bg-input`, with `--input` now mapped to a dedicated fill token (instead of the border color) so editable controls remain subtly distinct from `card`/`background` in both light and dark modes.
- Global theme hydration now runs from Inertia page props (not only initial boot payload), allowing branding updates to apply across all navigation targets; dark mode can be toggled from the staff header and persisted globally for super-admins while preserving per-browser local preference overrides.
- Inertia bootstrap theme hydration is now Inertia-context-safe: `ThemeBridge` no longer calls `usePage()` from `app.jsx` (outside the Inertia provider) and instead consumes initial branding from boot props while subscribing to Inertia `router.on('success')` updates for cross-page branding synchronization.
- Client portal header now uses logo-first branding (no duplicated text labels), includes an in-header light/dark toggle wired to shared `ThemeBridge` context, and resolves light/dark logo assets from the active mode while preserving logout/navigation behavior.
- Theme mode is now globally controlled by `ThemeBridge` context with localStorage-backed per-browser preference (`ksp-theme-mode`), so both staff and client portal surfaces re-render immediately on toggle while still inheriting shared branding tokens.
- Login experience now uses a centered single-card auth layout with only the theme-aware brand logo above the core sign-in fields, simplifying visual hierarchy while preserving the existing `/login` auth flow and validation behavior.
- Branding settings preview now renders inside an isolated CSS-token scope that uses the exact same token builder as the app root, preventing preview-only theme logic drift.
- Staff sidebar branding now renders a full-width logo treatment in expanded mode with compact collapsed fallback, and both staff/client portal brand surfaces now resolve light/dark logos using theme-aware fallback order (dark -> light -> legacy logo -> letter fallback).
- Branding settings save submission now uses the Inertia `useForm` pattern correctly by applying `form.transform(...)` before invoking `form.patch(...)` as separate calls, preventing runtime `undefined.patch` crashes while preserving multipart logo uploads and validation error hydration.
- Branding persistence readback now resolves the `branding` `app_settings` row through the `AppSetting` model instance (`first()?->value`) instead of querying a raw column scalar (`value('value')`), guaranteeing casted array hydration before merging defaults, cache sharing, and global theme token generation.
- Client portal ticket detail now supports policy-gated public replies through the shared `TicketMessageController` endpoint under `/portal/tickets/{ticket}/messages`, while preserving internal-note restrictions through `StoreTicketMessageRequest` and `TicketPolicy`.

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
- `Components/auth/animated-auth-background.jsx` (legacy reusable auth backdrop component retained in codebase but no longer used by the simplified login page)
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

## UI/UX Refactor Pass (Latest)
- Refactored core shadcn primitives for interaction quality and consistency:
  - `ui/button` now supports polished hover/focus/active transitions across default, secondary, outline, ghost, and destructive variants.
  - `ui/select` was rebuilt with Radix popper positioning, explicit portal layering, scroll controls, and stronger focus/hover states to resolve selection/display issues in constrained containers.
- Added missing interaction primitives and wrappers for progressive disclosure and in-context workflows:
  - `ui/sheet`, `ui/accordion`
  - reusable `entity-drawer`, `clickable-table-row`, `collapsible-detail-section`
- App shell responsiveness and navigation ergonomics improved:
  - Sidebar now supports desktop collapsed state persisted in localStorage.
  - Mobile sidebar now opens/closes through a sheet.
  - Header includes accessible sidebar toggle controls.
- Ticket workspace usability upgrades:
  - Ticket list rows are now consistently clickable and keyboard-accessible.
  - Row action menus prevent accidental row-trigger navigation.
  - Added quick ticket detail drawer from list rows with in-context status/assignment updates.
  - Activity log inside ticket detail now opens as a second nested right-side sub-drawer on top of the main ticket drawer to preserve layered workflows without leaving context.
  - Ticket detail page now emphasizes primary metadata and conversation first, with lower-priority details moved into accordion-based sections.
  - Internal notes are visually differentiated for readability.
- Introduced super-admin branding settings module with persistence:
  - New `app_settings` table and `AppSetting` model.
  - New `BrandingSettings` support helper for defaults + theme conversion.
  - New `Settings/Branding` Inertia page and backend controller/request for validation + persistence.
  - Logo upload/change/removal stored on `public` disk.
  - Global theme colors now applied via CSS variables from Inertia shared props (`branding.theme_hsl`).
  - Sidebar/header branding now consume configurable app name/logo.
- Route updates:
  - Added `GET /settings/branding` and `PATCH /settings/branding` (super-admin only).
  - Added `PATCH /settings/branding/dark-mode` for topbar dark-mode persistence (super-admin only).

- Added a shared `EntityCreateDrawer` composition on top of the reusable `entity-drawer` shell so entity create forms can run inside consistent right-side overlays with shared close/cancel behavior and scroll-safe body layout.
- Major staff create flows are now drawer-first on list pages (tickets, clients, contacts, client users, assets, services, SLA plans) while preserving full-page create routes for direct access/fallback.
- Store actions for the primary entities now honor a `from_drawer` flag to return back to the current screen after success (instead of forcing show-page redirects), preserving list context and enabling smooth drawer close + refresh UX.

## Pending Follow-up
- Extend drawer-based quick-edit workflows to additional entities (clients/assets/contacts) in the same reusable `entity-drawer` pattern.
- Add dedicated automated feature tests for branding settings authorization + upload lifecycle.
- Add end-to-end UI checks for select behavior inside nested overlays.

## Performance & Stability Hardening (Tickets + Shared Inertia State)
- Ticket index payload is now lazily evaluated via Inertia closure props (`tickets`, `drawerTicket`, `staff`, `clients`, `formData`) so partial reloads no longer execute unnecessary list/form queries when only drawer state is refreshed.
- Added `TicketController@activity` (`GET /tickets/{ticket}/activity`) to load activity timeline data on demand.
- Ticket workspace payload no longer preloads activity feed by default; conversation + attachments still load for active ticket drawer/full show while activity is fetched only when the nested activity drawer opens.
- Added slow-request instrumentation for ticket index and ticket activity endpoints (warning logs only when request duration exceeds thresholds) to help detect regressions without noisy per-request logging.
- Shared Inertia props in `HandleInertiaRequests` now use lazy closures to avoid eager policy/role/settings/notification work when partial responses do not need them.
- Branding and domain references are now cached in middleware-level shared props (`branding-settings:shared`, `domain-references:shared`) to remove repeated settings/enum-serialization overhead. Branding updates now explicitly invalidate the branding cache key to prevent stale theme props after save or refresh.
- Shared notification payload is cached briefly per user (`notifications:shared:{id}`) to reduce repeated `unread_count` + recent query pressure across frequent Inertia navigations; cache is explicitly invalidated on mark-read actions.

- Branding save/update flow now writes `card_border_color` as the canonical persisted field while still exposing compatibility aliases (`border_color`, `surface_border_color`) in shared Inertia props so existing UI tokens remain stable during the migration window.

## Branding/Settings Reliability Hardening (Latest)
- Root-cause hardening for branding persistence + hydration:
  - Branding settings request now accepts legacy `border_color` / `surface_border_color` aliases and normalizes them to canonical `card_border_color`, preventing validation-redirect loops from mismatched payload keys.
  - Branding form submissions now normalize boolean fields (`dark_mode_enabled`, `remove_logo`) in `UpdateBrandingSettingsRequest::prepareForValidation`, preventing multipart/form-data boolean coercion edge cases from causing silent validation failure.
  - Dark-mode patch submissions now normalize `dark_mode_enabled` in `UpdateBrandingDarkModeRequest::prepareForValidation` for consistent backend acceptance.
  - Branding controller update flow now reads from validated payload and merges with current values to avoid accidental field drops when optional values are omitted.
- Global theme source-of-truth fix:
  - Removed localStorage dark-mode override precedence from the root `ThemeBridge`; global UI now always follows persisted branding shared props (`props.branding.dark_mode_enabled`) across refresh and navigation.
  - Header dark-mode switch now persists through `/settings/branding/dark-mode` only (super-admin) and is disabled for users without settings permission, preventing non-persisted local-only drift.
- Global branding surface consistency:
  - Client portal header now reads shared branding app name.
  - Staff sidebar label copy no longer hardcodes vendor name, while still rendering persisted `branding.app_name`.
  - Root theme bridge updates `document.title` from persisted branding app name for app-wide naming consistency.
- Settings UX reliability:
  - Branding save action now sends explicit numeric boolean payloads and uses a full-page prop refresh (`preserveState: false`) to keep form state aligned with persisted values.
  - Branding save submission now uses a `POST` multipart request with Laravel method spoofing (`_method=patch`) instead of a real multipart `PATCH`, ensuring PHP/Laravel reliably parses all fields/files (`app_name`, colors, dark mode, `logo`, `remove_logo`) before validation + persistence.
  - Added a destructive alert block when branding validation fails, making failed saves visible.
- Added `tests/Feature/BrandingSettingsFlowTest.php` to cover super-admin branding persistence and boolean payload coercion behavior.

- Added regression test coverage for legacy border-color payload alias handling in branding save flow (`test_super_admin_can_save_branding_when_border_color_alias_is_submitted`).
- Added regression test coverage for method-spoofed branding saves with logo upload (`test_super_admin_can_update_branding_via_post_method_spoof_and_upload_logo`).

## Per-User Theme Mode Refactor (Latest)
- Root cause in previous architecture: dark/light mode lived in global branding (`branding.dark_mode_enabled`), so a single super-admin toggle changed theme mode for all users across both staff and client portal surfaces.
- Theme mode is now user-scoped via `users.theme_mode` (`light`/`dark`) and no longer controlled by branding settings.
- Added authenticated self-service endpoint `PATCH /settings/theme-mode` for persisting only the current user’s theme preference.
- Inertia shared props now include `auth.user.theme_mode`; frontend theme hydration reads this value as the sole mode source.
- `ThemeBridge` now applies branding tokens globally (colors/logo remain global) while applying light/dark mode from the authenticated user preference and persisting changes through the new endpoint.
- Staff and client portal topbar switches now both use the shared theme context and backend persistence path, keeping both experiences synchronized for the signed-in user.
- Branding settings page remains super-admin-only and now focuses on global branding only (app name, colors, light/dark logos); the global dark-mode control was removed.


## Super-Admin User & Role Management (Latest)
- Added a dedicated super-admin-only administration module for unified user lifecycle management at `/administration/users` with staff + client user creation/edit flows in drawers.
- Reused the existing single `users` identity model plus `client_user_profiles` extension for client-side access controls (company/contact link + ticket/asset/contact capability flags).
- Staff user management now assigns only non-`client-user` roles; client user management always enforces `client-user` role and updates `client_user_profiles` without changing client portal routing behavior.
- Added super-admin-only roles management at `/administration/roles` backed directly by Spatie roles/permissions (list/create/edit + permission assignment).
- Protected system roles from renaming in role management UI/controller: `super-admin`, `admin`, `staff`, `support-agent`, `asset-manager`, `client-user`.
- Sidebar navigation now exposes `User Management` and `Role Management` entries only when `authorization.canManageUsersAndRoles` is true (super-admin).

## Form UX Normalization Standards
- Shared form presentation is now centralized through reusable wrappers in `resources/js/Components/forms`:
  - `FormField` for consistent label/hint/error rendering.
  - `FormSelectField` for themed shadcn select usage (including nullable/empty options).
  - `FormDateField` for normalized date entry with consistent iconography and clear action.
  - `FormDateTimeField` for normalized datetime entry with consistent iconography and clear action.
  - `TimezoneSelectField` for searchable IANA timezone selection (`Intl.supportedValuesOf('timeZone')`) while preserving backend-compatible timezone values.
- Constrained free-text values are normalized into controlled options, with backward-safe handling via `withCurrentOption(...)` in `resources/js/lib/form-options.js` so legacy persisted values remain selectable/editable.
- Domain normalization defaults currently include:
  - Service `renewal_cycle`: `monthly`, `quarterly`, `semi_annually`, `annually`, `custom`.
  - Asset `environment`: `production`, `staging`, `development`, `test`, `sandbox`.
  - Client user `role_label`: curated contact/access role labels.
- Staff-side forms for Clients, Contacts, Client Users, Assets, Services, and Tickets now use shared normalized patterns for select/date/datetime/boolean controls instead of mixed native control styles, while keeping existing payload shapes and backend validation contracts intact.

## Form UX Standards (Updated)
- Timezone inputs must render as a single control only (no split search + select). Use `TimezoneSelectField` with a single searchable timezone input bound to IANA values.
- Major forms should include concise, helpful placeholders for text, textarea, numeric, URL, and email inputs when guidance improves completion quality.
- Constrained business fields must use prepopulated select options instead of arbitrary text where possible:
  - Ticket category: `incident`, `service_request`, `change_request`, `problem`, `access_request`
  - Ticket source: `portal`, `email`, `phone`, `chat`, `monitoring`, `onsite`
  - Contact department: `IT`, `Operations`, `Finance`, `HR`, `Procurement`, `Management`, `Support`, `Security`
  - Service renewal cycle: `monthly`, `quarterly`, `semi_annually`, `annually`, `custom`
  - Asset environment: `production`, `staging`, `development`, `test`, `sandbox`
  - Client user role label: catalog-backed role labels from `CLIENT_USER_ROLE_OPTIONS`
- Frontend option sets are centralized in `resources/js/lib/form-options.js`; backend validation mirrors those constraints via `App\Support\FormOptionCatalog` in request rules.
- For edit scenarios with legacy values, select inputs should use `withCurrentOption(...)` to display and preserve existing out-of-catalog values while guiding users to the canonical list.


### Route Inventory Additions (User/Role Management)
- `GET /administration/users` (`administration.users.index`)
- `POST /administration/users/staff` (`administration.users.staff.store`)
- `PATCH /administration/users/staff/{user}` (`administration.users.staff.update`)
- `POST /administration/users/client` (`administration.users.client.store`)
- `PATCH /administration/users/client/{clientUser}` (`administration.users.client.update`)
- `GET /administration/roles` (`administration.roles.index`)
- `POST /administration/roles` (`administration.roles.store`)
- `PATCH /administration/roles/{role}` (`administration.roles.update`)

## Self-Service Profile Management, Input Contrast, and Motion Polish (Latest)
- Added authenticated self-service profile settings at `/settings/profile` for all signed-in roles (staff workspace and client portal) without introducing cross-user edit flows.
- Profile settings now support updating own `name`, `email`, `password` (with current password verification), and `avatar` upload/removal.
- Avatar storage is persisted on the `public` disk at `avatars/*` via `users.avatar_path`; UI consumption uses `User::avatar_url` accessor + shared Inertia props (`auth.user.avatar_url`, `auth.user.avatar_initials`).
- Staff header dropdown and client portal topbar user menu now include `My Profile` and render uploaded avatar image with initials fallback.
- Form field surfaces were globally adjusted via shared shadcn primitives (`Input`, `Textarea`, `SelectTrigger`) and theme token refinements (`--input` in light/dark) so editable controls have clearer contrast against cards.
- Interaction polish enhancements were applied in shared primitives and layouts:
  - Added reusable animation utility classes for Radix state-based transitions (fade/slide in-out).
  - Improved sheet/drawer and dropdown enter/exit motion.
  - Added subtle page content fade-in in both staff and client layouts.
  - Added reusable `Skeleton` and replaced abrupt ticket activity loading text with skeleton placeholders.
- Reduced-motion preferences now disable app animation utility classes and skeleton pulse.

### Route Inventory Additions (Profile)
- `GET /settings/profile` (`settings.profile.edit`)
- `PATCH /settings/profile` (`settings.profile.update`)
- `PATCH /settings/profile/password` (`settings.profile.password.update`)
- `POST /settings/profile/avatar` (`settings.profile.avatar.update`)
- `DELETE /settings/profile/avatar` (`settings.profile.avatar.destroy`)
