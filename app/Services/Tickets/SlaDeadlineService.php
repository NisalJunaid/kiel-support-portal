<?php

namespace App\Services\Tickets;

use App\Models\ClientCompany;
use App\Models\Service;
use App\Models\SlaPlan;
use App\Models\Ticket;
use Carbon\CarbonInterface;

class SlaDeadlineService
{
    public function resolvePlanId(array $attributes): ?int
    {
        if (! empty($attributes['sla_plan_id'])) {
            return (int) $attributes['sla_plan_id'];
        }

        if (! empty($attributes['service_id'])) {
            $service = Service::query()->find($attributes['service_id']);
            if ($service?->sla_plan_id) {
                return (int) $service->sla_plan_id;
            }
        }

        if (! empty($attributes['client_company_id'])) {
            $client = ClientCompany::query()->find($attributes['client_company_id']);
            if ($client?->sla_plan_id) {
                return (int) $client->sla_plan_id;
            }
        }

        return null;
    }

    public function calculateDeadlines(?int $slaPlanId, CarbonInterface $baseAt): array
    {
        if (! $slaPlanId) {
            return [
                'sla_plan_id' => null,
                'first_response_due_at' => null,
                'resolution_due_at' => null,
            ];
        }

        $plan = SlaPlan::query()->find($slaPlanId);

        if (! $plan) {
            return [
                'sla_plan_id' => null,
                'first_response_due_at' => null,
                'resolution_due_at' => null,
            ];
        }

        return [
            'sla_plan_id' => $plan->id,
            'first_response_due_at' => $baseAt->copy()->addMinutes($plan->response_minutes),
            'resolution_due_at' => $baseAt->copy()->addMinutes($plan->resolution_minutes),
        ];
    }

    public function computeIndicator(Ticket $ticket, string $field): array
    {
        $dueAt = $ticket->{$field};

        if (! $dueAt) {
            return ['state' => 'none', 'label' => 'No SLA deadline'];
        }

        $isResolved = ! is_null($ticket->resolved_at) || ! is_null($ticket->closed_at);
        $minutes = now()->diffInMinutes($dueAt, false);

        if (! $isResolved && $minutes < 0) {
            return ['state' => 'breached', 'label' => 'Breached'];
        }

        if (! $isResolved && $minutes <= 30) {
            return ['state' => 'at_risk', 'label' => 'Due soon'];
        }

        return ['state' => 'healthy', 'label' => $isResolved ? 'Met/closed' : 'On track'];
    }
}
