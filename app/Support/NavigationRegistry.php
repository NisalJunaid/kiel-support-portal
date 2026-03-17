<?php

namespace App\Support;

class NavigationRegistry
{
    public static function staffItems(): array
    {
        return [
            ['key' => 'dashboard', 'label' => 'Dashboard', 'href' => '/dashboard', 'icon' => 'LayoutDashboard', 'requires' => 'isStaffWorkspace', 'context' => 'staff'],
            ['key' => 'clients', 'label' => 'Clients', 'href' => '/clients', 'icon' => 'Building2', 'requires' => 'canViewClients', 'context' => 'staff'],
            ['key' => 'contacts', 'label' => 'Contacts', 'href' => '/contacts', 'icon' => 'Users', 'requires' => 'canViewContacts', 'context' => 'staff'],
            ['key' => 'client-users', 'label' => 'Client Users', 'href' => '/client-users', 'icon' => 'Users', 'requires' => 'canViewClientUsers', 'context' => 'staff'],
            ['key' => 'assets', 'label' => 'Assets', 'href' => '/assets', 'icon' => 'Boxes', 'requires' => 'canViewAssets', 'context' => 'staff'],
            ['key' => 'tickets', 'label' => 'Tickets', 'href' => '/tickets', 'icon' => 'Ticket', 'requires' => 'canViewTickets', 'context' => 'staff'],
            ['key' => 'services', 'label' => 'Services', 'href' => '/services', 'icon' => 'Briefcase', 'requires' => 'canViewServices', 'context' => 'staff'],
            ['key' => 'sla-plans', 'label' => 'SLA Plans', 'href' => '/sla-plans', 'icon' => 'Timer', 'requires' => 'canViewSlaPlans', 'context' => 'staff'],
            ['key' => 'activity', 'label' => 'Activity', 'href' => '/activity', 'icon' => 'History', 'requires' => 'canViewActivity', 'context' => 'staff'],
            ['key' => 'notifications', 'label' => 'Notifications', 'href' => '/notifications', 'icon' => 'Bell', 'requires' => 'canViewNotifications', 'context' => 'staff'],
            ['key' => 'reports', 'label' => 'Reports', 'href' => '/reports', 'icon' => 'BarChart3', 'requires' => 'canViewReports', 'context' => 'staff'],
            ['key' => 'settings.branding', 'label' => 'Settings', 'href' => '/settings/branding', 'icon' => 'Settings', 'requires' => 'canViewSettings', 'context' => 'staff'],
            ['key' => 'administration.users', 'label' => 'User Management', 'href' => '/administration/users', 'icon' => 'Users', 'requires' => 'canManageUsersAndRoles', 'context' => 'staff'],
            ['key' => 'administration.roles', 'label' => 'Role Management', 'href' => '/administration/roles', 'icon' => 'Shield', 'requires' => 'canManageUsersAndRoles', 'context' => 'staff'],
            ['key' => 'administration.navigation-visibility', 'label' => 'Navigation Visibility', 'href' => '/administration/navigation-visibility', 'icon' => 'SlidersHorizontal', 'requires' => 'canManageUsersAndRoles', 'context' => 'staff'],
            ['key' => 'administration.readiness', 'label' => 'Administration', 'href' => '/administration', 'icon' => 'Shield', 'requires' => 'canViewAdminReadiness', 'context' => 'staff'],
            ['key' => 'administration.system-reference', 'label' => 'System Reference', 'href' => '/administration/system-reference', 'icon' => 'Shield', 'requires' => 'canViewSystemReference', 'context' => 'staff'],
        ];
    }

    public static function portalItems(): array
    {
        return [
            ['key' => 'portal.dashboard', 'label' => 'Dashboard', 'href' => '/portal/dashboard', 'icon' => 'LayoutDashboard', 'context' => 'portal'],
            ['key' => 'portal.tickets', 'label' => 'My Tickets', 'href' => '/portal/tickets', 'icon' => 'Ticket', 'context' => 'portal'],
            ['key' => 'portal.assets', 'label' => 'Assets', 'href' => '/portal/assets', 'icon' => 'Boxes', 'requires' => 'canViewAssets', 'context' => 'portal'],
            ['key' => 'portal.contacts', 'label' => 'Contacts', 'href' => '/portal/contacts', 'icon' => 'Users', 'requires' => 'canViewContacts', 'context' => 'portal'],
        ];
    }

    public static function groupedForManagement(): array
    {
        return [
            'staff' => self::staffItems(),
            'portal' => self::portalItems(),
        ];
    }

    public static function allItems(): array
    {
        return [...self::staffItems(), ...self::portalItems()];
    }

    public static function itemKeys(): array
    {
        return collect(self::allItems())->pluck('key')->values()->all();
    }

    public static function resolveForUser(?\App\Models\User $user, array $authorization): array
    {
        if (! $user) {
            return ['staff' => [], 'portal' => []];
        }

        $visibility = RoleNavigationVisibility::forRoles($user->getRoleNames()->all());

        $filter = function (array $items) use ($visibility, $authorization): array {
            return collect($items)
                ->filter(function (array $item) use ($visibility, $authorization) {
                    $configured = (bool) ($visibility[$item['key']] ?? self::defaultVisibilityForRoleContext($item['context']));
                    $authorized = ! isset($item['requires']) || (bool) ($authorization[$item['requires']] ?? false);

                    return $configured && $authorized;
                })
                ->values()
                ->all();
        };

        return [
            'staff' => $filter(self::staffItems()),
            'portal' => $filter(self::portalItems()),
        ];
    }

    public static function defaultVisibilityForRole(string $role, array $item): bool
    {
        return self::defaultVisibilityForRoleContext($item['context'], $role);
    }

    private static function defaultVisibilityForRoleContext(string $context, ?string $role = null): bool
    {
        if ($context === 'portal') {
            return $role === null ? true : $role === Roles::CLIENT_USER;
        }

        return $role === null ? true : $role !== Roles::CLIENT_USER;
    }
}
