<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    public function viewAny(User $user): bool
    {
        if ($user->isClientUser()) {
            return $user->clientUserProfile !== null;
        }

        return $user->can('tickets.view');
    }

    public function view(User $user, Ticket $ticket): bool
    {
        if ($user->isClientUser()) {
            $profile = $user->clientUserProfile;

            return $profile !== null
                && $profile->client_company_id === $ticket->client_company_id;
        }

        return $user->can('tickets.view');
    }

    public function create(User $user): bool
    {
        if ($user->isClientUser()) {
            return (bool) $user->clientUserProfile?->can_create_tickets;
        }

        return $user->can('tickets.create');
    }

    public function update(User $user, Ticket $ticket): bool
    {
        if ($user->isClientUser()) {
            return false;
        }

        return $user->can('tickets.update');
    }

    public function addPublicReply(User $user, Ticket $ticket): bool
    {
        return $this->view($user, $ticket);
    }

    public function addInternalNote(User $user, Ticket $ticket): bool
    {
        if ($user->isClientUser()) {
            return false;
        }

        return $this->update($user, $ticket);
    }

    public function delete(User $user, Ticket $ticket): bool
    {
        if ($user->isClientUser()) {
            return false;
        }

        return $user->can('tickets.delete');
    }
}
