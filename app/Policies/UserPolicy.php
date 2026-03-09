<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAdminReadiness(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'staff']);
    }

    public function viewSystemReference(User $user): bool
    {
        return $this->viewAdminReadiness($user);
    }
}
