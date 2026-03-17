<?php

namespace App\Http\Requests\Administration;

use App\Support\NavigationRegistry;
use App\Support\Roles;
use Illuminate\Foundation\Http\FormRequest;

class UpdateRoleNavigationVisibilityRequest extends FormRequest
{
    use EnsureSuperAdmin;

    public function rules(): array
    {
        return [
            'visibility' => ['required', 'array'],
            'visibility.*' => ['array'],
            'visibility.*.*' => ['boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $visibility = $this->input('visibility', []);
        $roles = Roles::all();
        $keys = NavigationRegistry::itemKeys();

        $normalized = [];

        foreach ($roles as $role) {
            $rolePayload = is_array($visibility[$role] ?? null) ? $visibility[$role] : [];
            $normalized[$role] = [];

            foreach ($keys as $key) {
                $normalized[$role][$key] = filter_var($rolePayload[$key] ?? false, FILTER_VALIDATE_BOOL);
            }
        }

        $this->merge(['visibility' => $normalized]);
    }
}
