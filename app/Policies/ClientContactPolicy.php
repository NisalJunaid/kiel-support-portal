<?php

namespace App\Policies;

use App\Models\ClientContact;
use App\Models\User;

class ClientContactPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('contacts.view');
    }

    public function view(User $user, ClientContact $clientContact): bool
    {
        return $user->can('contacts.view');
    }

    public function create(User $user): bool
    {
        return $user->can('contacts.create');
    }

    public function update(User $user, ClientContact $clientContact): bool
    {
        return $user->can('contacts.update');
    }

    public function delete(User $user, ClientContact $clientContact): bool
    {
        return $user->can('contacts.delete');
    }
}
