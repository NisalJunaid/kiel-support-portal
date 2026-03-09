<?php

namespace App\Enums;

enum ServiceType: string
{
    case ManagedHosting = 'managed_hosting';
    case DomainManagement = 'domain_management';
    case EmailManagement = 'email_management';
    case Monitoring = 'monitoring';
    case Backup = 'backup';
    case Security = 'security';
    case SupportRetainer = 'support_retainer';
    case Other = 'other';

    public function label(): string
    {
        return str($this->value)->replace('_', ' ')->title()->value();
    }

    public function badgeVariant(): string
    {
        return match ($this) {
            self::ManagedHosting, self::SupportRetainer => 'info',
            self::Monitoring, self::Backup => 'secondary',
            self::Security => 'warning',
            self::DomainManagement, self::EmailManagement => 'outline',
            self::Other => 'secondary',
        };
    }
}
