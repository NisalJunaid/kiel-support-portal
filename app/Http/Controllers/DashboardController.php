<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Dashboard/Index', [
            'summaryCards' => [
                ['label' => 'Open Tickets', 'value' => '42', 'change' => '+8% this week', 'status' => 'warning'],
                ['label' => 'SLA At Risk', 'value' => '6', 'change' => '-2 from yesterday', 'status' => 'destructive'],
                ['label' => 'Active Clients', 'value' => '128', 'change' => '+4 this month', 'status' => 'success'],
                ['label' => 'Assets Monitored', 'value' => '1,486', 'change' => '99.8% reporting', 'status' => 'info'],
            ],
            'priorityQueue' => [
                ['ticket' => 'INC-1042', 'subject' => 'VPN tunnel instability', 'client' => 'Northwind Health', 'priority' => 'High', 'status' => 'Investigating'],
                ['ticket' => 'REQ-3921', 'subject' => 'New user provisioning', 'client' => 'Acme Distribution', 'priority' => 'Medium', 'status' => 'Waiting on client'],
                ['ticket' => 'INC-1036', 'subject' => 'Backup verification failed', 'client' => 'Lumen Logistics', 'priority' => 'Critical', 'status' => 'Escalated'],
            ],
        ]);
    }
}
