<?php

namespace App\Http\Requests;

use App\Enums\AssetCriticality;
use App\Enums\AssetStatus;
use App\Models\Asset;
use App\Models\AssetType;
use App\Support\AssetMetaFields;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Support\FormOptionCatalog;
use Illuminate\Validation\Validator;

class StoreAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Asset::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        $meta = $this->input('meta', []);
        $slug = $this->assetTypeSlug();
        $allowedKeys = AssetMetaFields::allowedKeysForSlug($slug);

        if (! is_array($meta)) {
            $meta = [];
        }

        if ($allowedKeys === []) {
            $meta = [];
        } else {
            $meta = array_intersect_key($meta, array_flip($allowedKeys));
        }

        $this->merge(['meta' => $meta]);
    }

    public function rules(): array
    {
        $slug = $this->assetTypeSlug();

        return [
            'client_company_id' => ['required', 'exists:client_companies,id'],
            'parent_asset_id' => ['nullable', 'exists:assets,id'],
            'asset_type_id' => ['required', 'exists:asset_types,id'],
            'name' => ['required', 'string', 'max:255'],
            'asset_code' => ['required', 'string', 'max:100', 'alpha_dash', 'unique:assets,asset_code'],
            'service_category' => ['nullable', Rule::in(FormOptionCatalog::TICKET_CATEGORIES)],
            'status' => ['required', Rule::enum(AssetStatus::class)],
            'environment' => ['nullable', Rule::in(FormOptionCatalog::ENVIRONMENTS)],
            'criticality' => ['required', Rule::enum(AssetCriticality::class)],
            'assigned_staff_id' => ['nullable', 'exists:users,id'],
            'start_date' => ['nullable', 'date'],
            'renewal_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'vendor' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'meta' => ['nullable', 'array'],
            ...AssetMetaFields::rulesForSlug($slug),
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $meta = $this->input('meta', []);

            if (! is_array($meta)) {
                return;
            }

            $unexpectedKeys = array_diff(array_keys($meta), AssetMetaFields::allowedKeysForSlug($this->assetTypeSlug()));

            if ($unexpectedKeys !== []) {
                $validator->errors()->add('meta', 'Unexpected metadata fields provided for this asset type.');
            }
        });
    }

    private function assetTypeSlug(): ?string
    {
        $assetTypeId = $this->input('asset_type_id');

        if (! $assetTypeId) {
            return null;
        }

        return AssetType::query()->whereKey($assetTypeId)->value('slug');
    }
}
