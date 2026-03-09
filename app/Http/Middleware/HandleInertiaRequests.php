<?php

namespace App\Http\Middleware;

use App\Support\DomainReferenceCatalog;
use Illuminate\Http\Request;
use Inertia\Middleware;

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
            'auth' => [
                'user' => $user
                    ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'roles' => $user->getRoleNames()->values(),
                    ]
                    : null,
            ],
            'authorization' => [
                'canViewAdminReadiness' => $user ? $user->can('viewAdminReadiness', $user) : false,
                'canViewSystemReference' => $user ? $user->can('viewSystemReference', $user) : false,
                'canViewClients' => $user ? $user->can('viewAny', \App\Models\ClientCompany::class) : false,
                'canViewContacts' => $user ? $user->can('viewAny', \App\Models\ClientContact::class) : false,
                'canViewClientUsers' => $user ? $user->can('viewAny', \App\Models\ClientUserProfile::class) : false,
                'canViewAssets' => $user ? $user->can('viewAny', \App\Models\Asset::class) : false,
            ],
            'domainReferences' => DomainReferenceCatalog::all(),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ]);
    }
}
