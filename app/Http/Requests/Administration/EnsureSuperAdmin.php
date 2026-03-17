<?php

namespace App\Http\Requests\Administration;

use App\Support\Roles;

trait EnsureSuperAdmin
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(Roles::SUPER_ADMIN) ?? false;
    }
}
