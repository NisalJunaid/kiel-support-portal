<?php

namespace App\Providers;

use App\Models\ClientCompany;
use App\Models\ClientContact;
use App\Models\ClientUserProfile;
use App\Models\User;
use App\Policies\ClientCompanyPolicy;
use App\Policies\ClientContactPolicy;
use App\Policies\ClientUserProfilePolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        User::class => UserPolicy::class,
        ClientCompany::class => ClientCompanyPolicy::class,
        ClientContact::class => ClientContactPolicy::class,
        ClientUserProfile::class => ClientUserProfilePolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        Gate::before(function (User $user) {
            return $user->hasRole('super-admin') ? true : null;
        });
    }
}
