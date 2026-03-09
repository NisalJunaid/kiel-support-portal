<?php

namespace App\Policies;

use App\Models\SlaPlan;
use App\Models\User;

class SlaPlanPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('sla-plans.view');
    }

    public function view(User $user, SlaPlan $slaPlan): bool
    {
        return $user->can('sla-plans.view');
    }

    public function create(User $user): bool
    {
        return $user->can('sla-plans.create');
    }

    public function update(User $user, SlaPlan $slaPlan): bool
    {
        return $user->can('sla-plans.update');
    }

    public function delete(User $user, SlaPlan $slaPlan): bool
    {
        return $user->can('sla-plans.delete');
    }
}
