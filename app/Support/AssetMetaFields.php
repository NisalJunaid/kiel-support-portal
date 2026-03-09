<?php

namespace App\Support;

class AssetMetaFields
{
    public static function definitions(): array
    {
        return [
            'hosting-account' => [
                ['key' => 'control_panel_url', 'label' => 'Control panel URL', 'input' => 'url', 'rules' => ['nullable', 'url', 'max:255']],
                ['key' => 'server_ip', 'label' => 'Server IP', 'input' => 'text', 'rules' => ['nullable', 'ip']],
                ['key' => 'hostname', 'label' => 'Hostname', 'input' => 'text', 'rules' => ['nullable', 'string', 'max:255']],
                ['key' => 'plan', 'label' => 'Plan', 'input' => 'text', 'rules' => ['nullable', 'string', 'max:255']],
            ],
            'email-hosting' => [
                ['key' => 'mail_server', 'label' => 'Mail server', 'input' => 'text', 'rules' => ['nullable', 'string', 'max:255']],
                ['key' => 'domain', 'label' => 'Domain', 'input' => 'text', 'rules' => ['nullable', 'string', 'max:255']],
                ['key' => 'mailbox_count', 'label' => 'Mailbox count', 'input' => 'number', 'rules' => ['nullable', 'integer', 'min:0']],
            ],
            'website' => [
                ['key' => 'live_url', 'label' => 'Live URL', 'input' => 'url', 'rules' => ['nullable', 'url', 'max:255']],
                ['key' => 'cms_framework', 'label' => 'CMS / framework', 'input' => 'text', 'rules' => ['nullable', 'string', 'max:255']],
                ['key' => 'repo_link', 'label' => 'Repository link', 'input' => 'url', 'rules' => ['nullable', 'url', 'max:255']],
            ],
            'domain' => [
                ['key' => 'registrar', 'label' => 'Registrar', 'input' => 'text', 'rules' => ['nullable', 'string', 'max:255']],
                ['key' => 'expiry_date', 'label' => 'Expiry date', 'input' => 'date', 'rules' => ['nullable', 'date']],
                ['key' => 'nameservers', 'label' => 'Nameservers', 'input' => 'textarea', 'rules' => ['nullable', 'string', 'max:2000']],
                ['key' => 'auto_renew', 'label' => 'Auto-renew', 'input' => 'boolean', 'rules' => ['nullable', 'boolean']],
            ],
        ];
    }

    public static function forSlug(?string $slug): array
    {
        if (! $slug) {
            return [];
        }

        return self::definitions()[$slug] ?? [];
    }

    public static function rulesForSlug(?string $slug): array
    {
        $rules = [];

        foreach (self::forSlug($slug) as $field) {
            $rules['meta.'.$field['key']] = $field['rules'];
        }

        return $rules;
    }

    public static function allowedKeysForSlug(?string $slug): array
    {
        return array_column(self::forSlug($slug), 'key');
    }
}
