<?php

namespace App\Http\Middleware;

use App\Support\BrandingSettings;
use App\Support\DomainReferenceCatalog;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\Cache;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        return array_merge(parent::share($request), [
            'auth' => fn () => [
                'user' => $user
                    ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'roles' => $user->getRoleNames()->values(),
                        'is_client_user' => $user->isClientUser(),
                        'theme_mode' => $user->theme_mode,
                        'avatar_url' => $user->avatar_url,
                        'avatar_initials' => strtoupper($user->initials() ?: 'U'),
                    ]
                    : null,
            ],
            'authorization' => fn () => [
                'canViewAdminReadiness' => $user ? $user->can('viewAdminReadiness', $user) : false,
                'canViewSystemReference' => $user ? $user->can('viewSystemReference', $user) : false,
                'canViewClients' => $user ? $user->can('viewAny', \App\Models\ClientCompany::class) : false,
                'canCreateClients' => $user ? $user->can('create', \App\Models\ClientCompany::class) : false,
                'canViewClientUsers' => $user ? $user->can('viewAny', \App\Models\ClientUserProfile::class) : false,
                'canViewServices' => $user ? $user->can('viewAny', \App\Models\Service::class) : false,
                'canViewTickets' => $user ? $user->can('viewAny', \App\Models\Ticket::class) : false,
                'canCreateTickets' => $user ? $user->can('create', \App\Models\Ticket::class) : false,
                'canViewSlaPlans' => $user ? $user->can('viewAny', \App\Models\SlaPlan::class) : false,
                'canViewActivity' => $user ? $user->hasAnyRole(['super-admin', 'admin', 'staff']) : false,
                'canViewReports' => $user ? $user->hasAnyRole(['super-admin', 'admin', 'staff']) : false,
                'canAccessClientPortal' => $user ? $user->isClientUser() : false,
                'canViewAssets' => $user ? $user->can('viewAny', \App\Models\Asset::class) : false,
                'canViewContacts' => $user ? $user->can('viewAny', \App\Models\ClientContact::class) : false,
                'canViewNotifications' => $user ? (! $user->isClientUser()) : false,
                'canViewSettings' => $user ? $user->hasRole('super-admin') : false,
                'canManageUsersAndRoles' => $user ? $user->hasRole('super-admin') : false,
                'isStaffWorkspace' => $user ? (! $user->isClientUser()) : false,
            ],
            'branding' => fn () => BrandingSettings::cached(),
            'domainReferences' => fn () => Cache::rememberForever('domain-references:shared', fn () => DomainReferenceCatalog::all()),
            'notifications' => fn () => $this->sharedNotifications($request),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ]);
    }

    private function sharedNotifications(Request $request): array
    {
        $user = $request->user();

        if (! $user) {
            return [
                'unread_count' => 0,
                'recent' => [],
            ];
        }

        return Cache::remember(
            sprintf('notifications:shared:%d', $user->id),
            now()->addSeconds(15),
            fn () => [
                'unread_count' => $user->unreadNotifications()->count(),
                'recent' => $user->notifications()
                    ->latest()
                    ->limit(5)
                    ->get()
                    ->map(fn ($notification) => [
                        'id' => $notification->id,
                        'title' => $notification->data['title'] ?? 'Notification',
                        'message' => $notification->data['message'] ?? '',
                        'url' => $notification->data['url'] ?? null,
                        'read_at' => optional($notification->read_at)?->toDateTimeString(),
                        'created_at' => optional($notification->created_at)?->toDateTimeString(),
                    ])
                    ->values(),
            ],
        );
    }
}
