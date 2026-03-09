<?php

namespace App\Support;

use App\Enums\AssetCriticality;
use App\Enums\AssetStatus;
use App\Enums\ClientStatus;
use App\Enums\ContactType;
use App\Enums\ServiceStatus;
use App\Enums\TicketMessageType;
use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Enums\UserType;

class DomainReferenceCatalog
{
    public static function all(): array
    {
        return [
            'userType' => self::serialize('User Type', UserType::cases()),
            'clientStatus' => self::serialize('Client Status', ClientStatus::cases()),
            'contactType' => self::serialize('Contact Type', ContactType::cases()),
            'assetStatus' => self::serialize('Asset Status', AssetStatus::cases()),
            'assetCriticality' => self::serialize('Asset Criticality', AssetCriticality::cases()),
            'ticketStatus' => self::serialize('Ticket Status', TicketStatus::cases()),
            'ticketPriority' => self::serialize('Ticket Priority', TicketPriority::cases()),
            'ticketMessageType' => self::serialize('Ticket Message Type', TicketMessageType::cases()),
            'serviceStatus' => self::serialize('Service Status', ServiceStatus::cases()),
        ];
    }

    private static function serialize(string $label, array $cases): array
    {
        return [
            'label' => $label,
            'options' => array_map(
                fn ($case) => [
                    'value' => $case->value,
                    'label' => $case->label(),
                    'badgeVariant' => $case->badgeVariant(),
                ],
                $cases,
            ),
        ];
    }
}
