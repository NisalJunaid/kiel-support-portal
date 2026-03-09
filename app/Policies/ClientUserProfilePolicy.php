<?php

namespace App\Policies;

use App\Models\ClientUserProfile;
use App\Models\User;

class ClientUserProfilePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('client-users.view');
    }

    public function view(User $user, ClientUserProfile $clientUserProfile): bool
    {
        return $user->can('client-users.view');
    }

    public function create(User $user): bool
    {
        return $user->can('client-users.create');
    }

    public function update(User $user, ClientUserProfile $clientUserProfile): bool
    {
        return $user->can('client-users.update');
    }

    public function delete(User $user, ClientUserProfile $clientUserProfile): bool
    {
        return $user->can('client-users.delete');
    }
}
