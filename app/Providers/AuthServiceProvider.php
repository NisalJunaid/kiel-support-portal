<?php

namespace App\Providers;

use App\Models\Asset;
use App\Models\ClientCompany;
use App\Models\ClientContact;
use App\Models\ClientUserProfile;
use App\Models\Service;
use App\Models\SlaPlan;
use App\Models\Ticket;
use App\Models\User;
use App\Policies\AssetPolicy;
use App\Policies\ClientCompanyPolicy;
use App\Policies\ClientContactPolicy;
use App\Policies\ClientUserProfilePolicy;
use App\Policies\ServicePolicy;
use App\Policies\SlaPlanPolicy;
use App\Policies\TicketPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        User::class => UserPolicy::class,
        Asset::class => AssetPolicy::class,
        ClientCompany::class => ClientCompanyPolicy::class,
        ClientContact::class => ClientContactPolicy::class,
        ClientUserProfile::class => ClientUserProfilePolicy::class,
        Service::class => ServicePolicy::class,
        SlaPlan::class => SlaPlanPolicy::class,
        Ticket::class => TicketPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        Gate::before(function (User $user) {
            return $user->hasRole('super-admin') ? true : null;
        });
    }
}
