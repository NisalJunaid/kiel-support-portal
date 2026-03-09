<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\ClientCompany;
use App\Models\ClientContact;
use App\Models\ClientUserProfile;
use App\Models\Service;
use App\Models\Ticket;
use App\Support\ActivityPresenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ActivityController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Ticket::class);

        $logName = $request->string('log_name')->toString();

        $logs = collect(['clients', 'contacts', 'client-users', 'assets', 'services', 'tickets']);

        $activity = Activity::query()
            ->with(['causer:id,name'])
            ->whereIn('log_name', $logs)
            ->when($logName && $logs->contains($logName), fn ($query) => $query->where('log_name', $logName))
            ->latest()
            ->paginate(30)
            ->withQueryString()
            ->through(fn (Activity $item) => [
                ...ActivityPresenter::forTimeline($item),
                'subject_link' => $this->subjectLink($item),
            ]);

        return Inertia::render('Activity/Index', [
            'activity' => $activity,
            'filters' => [
                'log_name' => $logName,
            ],
            'logOptions' => $logs->map(fn (string $log) => ['value' => $log, 'label' => ucfirst(str_replace('-', ' ', $log))])->values(),
        ]);
    }

    private function subjectLink(Activity $item): ?string
    {
        return match ($item->subject_type) {
            ClientCompany::class => $item->subject_id ? route('clients.show', $item->subject_id) : null,
            ClientContact::class => $item->subject_id ? route('contacts.show', $item->subject_id) : null,
            ClientUserProfile::class => $item->subject_id ? route('client-users.show', $item->subject_id) : null,
            Asset::class => $item->subject_id ? route('assets.show', $item->subject_id) : null,
            Service::class => $item->subject_id ? route('services.show', $item->subject_id) : null,
            Ticket::class => $item->subject_id ? route('tickets.show', $item->subject_id) : null,
            default => null,
        };
    }
}
