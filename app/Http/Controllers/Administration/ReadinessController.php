<?php

namespace App\Http\Controllers\Administration;

use App\Http\Controllers\Controller;
use App\Support\Roles;
use Inertia\Inertia;
use Inertia\Response;

class ReadinessController extends Controller
{
    public function __invoke(): Response
    {
        $this->authorize('viewAdminReadiness', auth()->user());

        $user = auth()->user();

        return Inertia::render('Administration/Readiness', [
            'currentUser' => [
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames()->values(),
            ],
            'seededRoles' => Roles::all(),
            'permissionReadinessNote' => 'Permission groups and per-module permissions are scaffold-ready via Spatie. Assign granular abilities as module CRUD is implemented.',
        ]);
    }
}
