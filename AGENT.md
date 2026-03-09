You are implementing a production-grade support portal for a company named Kiel using a Laravel 10 monolith with React running inside Laravel via Inertia.js. Do not split backend and frontend into separate apps.

Important implementation rules:
- Every feature you implement must include both:
  1. backend/business logic
  2. the required UI/pages/forms/tables/detail views to actually use that feature
- Do not leave features backend-only unless explicitly told to
- Use shadcn/ui for UI components
- Build usable admin/staff-facing interfaces as each feature is added
- Prefer polished CRUD pages over bare placeholders
- Preserve existing working code
- Do not rewrite unrelated files
- Keep code modular and production-ready

Core stack:
- Laravel 10+
- React
- Inertia.js
- Vite
- Tailwind CSS
- shadcn/ui
- MySQL
- Spatie laravel-permission
- Spatie activitylog

Architecture requirements:
- Monolith architecture only
- React pages must live inside Laravel resources/js
- Use Inertia for server-driven React pages
- Use Laravel controllers, form requests, policies, services, actions, notifications, jobs
- Prefer TypeScript for React if feasible; if TS is not already set up, you may stay in JSX but maintain consistency
- Use soft deletes where appropriate
- Use role/permission-based authorization
- Use Laravel policies for protected resources
- Use enums or constants for statuses/types where appropriate
- Use clean naming and maintainable folder structure

UI requirements:
- Use shadcn/ui components for:
  - buttons
  - forms
  - inputs
  - selects
  - dialog/modals
  - dropdown menus
  - sheets/drawers where useful
  - cards
  - badges
  - tables
  - tabs
  - alerts
  - breadcrumbs
  - pagination
- Use a consistent app layout with sidebar + topbar
- Staff/admin UI must be functional after each feature
- If a module is implemented, create the necessary:
  - index/list page
  - create page or modal
  - edit page or modal
  - show/detail page
  - navigation links if needed
  - validation feedback
  - empty states
- Build reusable UI components when patterns repeat
- Use status badges, table filters, and action dropdowns where useful
- Make the app look like an internal ops portal, not a demo

Business requirements:
- Admin/staff can create client companies, client users, contacts, assets, tickets
- Clients cannot self-register
- A client company can have multiple contacts / points of contact
- Client users belong to a client company
- Support tickets should link to client assets where possible
- Assets belong to client companies
- Staff can manage tickets/assets/clients depending on permissions
- Client users can only view their company data based on permissions
- Ticket conversation supports public replies and internal notes
- Audit logging exists for critical actions

Main modules:
- Authentication
- Roles & permissions
- Dashboard
- Clients
- Client contacts
- Client users
- Assets
- Tickets
- Ticket messages / notes
- Services
- SLA basics
- Reports
- Notifications
- Activity log

Code organization preferences:
- app/Actions/*
- app/Services/*
- app/Enums/*
- app/Policies/*
- app/Http/Controllers/*
- app/Http/Requests/*
- resources/js/Components/*
- resources/js/Layouts/*
- resources/js/Pages/*
- resources/js/lib/*
- resources/js/types/* if TypeScript is present

Expected behavior in every task:
1. Inspect existing code before changing anything
2. Preserve conventions already in the project
3. Add missing backend + frontend pieces together
4. Update routes, controllers, requests, policies, models, migrations, factories, seeders as needed
5. Build or update Inertia React pages
6. Use shadcn/ui components for the UI
7. Add server validation and client-facing error display
8. Ensure navigation to the new pages exists where appropriate
9. Keep the feature in a usable state
10. Summarize what was implemented and any follow-up gaps

Also create and continuously maintain a file:
docs/implementation-blueprint.md

That file should contain:
- current architecture decisions
- implemented modules
- pending modules
- route inventory
- model inventory
- permission inventory
- UI page inventory

Before making changes in any prompt:
- read docs/implementation-blueprint.md if it exists
- update it after completing the work