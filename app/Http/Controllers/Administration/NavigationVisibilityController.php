<?php

namespace App\Http\Controllers\Administration;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administration\UpdateRoleNavigationVisibilityRequest;
use App\Support\NavigationRegistry;
use App\Support\RoleNavigationVisibility;
use App\Support\Roles;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NavigationVisibilityController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->hasRole(Roles::SUPER_ADMIN), 403);

        return Inertia::render('Administration/NavigationVisibility/Index', [
            'roles' => Roles::all(),
            'items' => NavigationRegistry::groupedForManagement(),
            'visibility' => RoleNavigationVisibility::all(),
        ]);
    }

    public function update(UpdateRoleNavigationVisibilityRequest $request): RedirectResponse
    {
        RoleNavigationVisibility::update($request->validated('visibility', []));

        return back()->with('success', 'Navigation visibility rules updated.');
    }
}
