<?php

namespace App\Policies;

use App\Models\Asset;
use App\Models\User;

class AssetPolicy
{
    public function viewAny(User $user): bool
    {
        if ($user->isClientUser()) {
            return (bool) $user->clientUserProfile?->can_view_assets;
        }

        return $user->can('assets.view');
    }

    public function view(User $user, Asset $asset): bool
    {
        if ($user->isClientUser()) {
            $profile = $user->clientUserProfile;

            return (bool) $profile?->can_view_assets
                && $profile->client_company_id === $asset->client_company_id;
        }

        return $user->can('assets.view');
    }

    public function create(User $user): bool
    {
        if ($user->isClientUser()) {
            return false;
        }

        return $user->can('assets.create');
    }

    public function update(User $user, Asset $asset): bool
    {
        if ($user->isClientUser()) {
            return false;
        }

        return $user->can('assets.update');
    }

    public function delete(User $user, Asset $asset): bool
    {
        if ($user->isClientUser()) {
            return false;
        }

        return $user->can('assets.delete');
    }
}
