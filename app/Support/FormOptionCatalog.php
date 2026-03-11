<?php

namespace App\Support;

class FormOptionCatalog
{
    public const TICKET_CATEGORIES = [
        'incident',
        'service_request',
        'change_request',
        'problem',
        'access_request',
    ];

    public const CONTACT_DEPARTMENTS = [
        'IT',
        'Operations',
        'Finance',
        'HR',
        'Procurement',
        'Management',
        'Support',
        'Security',
    ];

    public const CLIENT_USER_ROLE_LABELS = [
        'Primary Contact',
        'Billing Contact',
        'Technical Contact',
        'Operations Contact',
        'Requester',
        'Approver',
        'Administrator',
    ];


    public const TICKET_SOURCES = [
        'portal',
        'email',
        'phone',
        'chat',
        'monitoring',
        'onsite',
    ];

    public const RENEWAL_CYCLES = [
        'monthly',
        'quarterly',
        'semi_annually',
        'annually',
        'custom',
    ];

    public const ENVIRONMENTS = [
        'production',
        'staging',
        'development',
        'test',
        'sandbox',
    ];
}
