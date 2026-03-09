<?php

namespace App\Policies;

use App\Models\ClientContact;
use App\Models\User;

class ClientContactPolicy
{
    public function viewAny(User $user): bool
    {
        if ($user->isClientUser()) {
            return $user->clientUserProfile !== null;
        }

        return $user->can('contacts.view');
    }

    public function view(User $user, ClientContact $clientContact): bool
    {
        if ($user->isClientUser()) {
            $profile = $user->clientUserProfile;

            return $profile !== null
                && $profile->client_company_id === $clientContact->client_company_id;
        }

        return $user->can('contacts.view');
    }

    public function create(User $user): bool
    {
        if ($user->isClientUser()) {
            return false;
        }

        return $user->can('contacts.create');
    }

    public function update(User $user, ClientContact $clientContact): bool
    {
        if ($user->isClientUser()) {
            return false;
        }

        return $user->can('contacts.update');
    }

    public function delete(User $user, ClientContact $clientContact): bool
    {
        if ($user->isClientUser()) {
            return false;
        }

        return $user->can('contacts.delete');
    }
}
