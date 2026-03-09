<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClientContactRequest;
use App\Http\Requests\UpdateClientContactRequest;
use App\Models\ClientCompany;
use App\Models\ClientContact;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use App\Support\ActivityPresenter;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ClientContactController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ClientContact::class);

        $search = trim((string) $request->string('search'));
        $clientId = $request->integer('client_company_id') ?: null;

        $contacts = ClientContact::query()
            ->with('clientCompany:id,name')
            ->when($search, function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('full_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('mobile', 'like', "%{$search}%");
                });
            })
            ->when($clientId, fn ($query) => $query->where('client_company_id', $clientId))
            ->orderByDesc('is_active')
            ->orderBy('full_name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (ClientContact $contact) => [
                'id' => $contact->id,
                'full_name' => $contact->full_name,
                'email' => $contact->email,
                'phone' => $contact->phone,
                'mobile' => $contact->mobile,
                'contact_type' => $contact->contact_type?->value,
                'escalation_level' => $contact->escalation_level,
                'is_active' => $contact->is_active,
                'client_company' => $contact->clientCompany,
            ]);

        return Inertia::render('Contacts/Index', [
            'contacts' => $contacts,
            'filters' => [
                'search' => $search,
                'client_company_id' => $clientId,
            ],
            'clients' => $this->clientOptions(),
            'can' => [
                'create' => $request->user()->can('create', ClientContact::class),
                'update' => $request->user()->can('contacts.update'),
                'delete' => $request->user()->can('contacts.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', ClientContact::class);

        return Inertia::render('Contacts/Create', [
            'clients' => $this->clientOptions(),
            'defaults' => [
                'client_company_id' => $request->integer('client') ?: null,
            ],
        ]);
    }

    public function store(StoreClientContactRequest $request): RedirectResponse
    {
        $contact = ClientContact::create($request->validated());

        activity('contacts')
            ->performedOn($contact)
            ->causedBy($request->user())
            ->event('created')
            ->withProperties(['email' => $contact->email])
            ->log('Client contact created');

        return redirect()->route('contacts.show', $contact)->with('success', 'Contact created successfully.');
    }

    public function show(Request $request, ClientContact $contact): Response
    {
        $this->authorize('view', $contact);

        $contact->load('clientCompany:id,name');

        $activity = Activity::query()
            ->where('subject_type', ClientContact::class)
            ->where('subject_id', $contact->id)
            ->latest()
            ->limit(12)
            ->get();

        return Inertia::render('Contacts/Show', [
            'contact' => [
                'id' => $contact->id,
                'client_company' => $contact->clientCompany,
                'full_name' => $contact->full_name,
                'title' => $contact->title,
                'department' => $contact->department,
                'email' => $contact->email,
                'phone' => $contact->phone,
                'mobile' => $contact->mobile,
                'contact_type' => $contact->contact_type?->value,
                'escalation_level' => $contact->escalation_level,
                'preferred_contact_method' => $contact->preferred_contact_method,
                'is_active' => $contact->is_active,
                'notes' => $contact->notes,
                'created_at' => optional($contact->created_at)?->toDateTimeString(),
                'updated_at' => optional($contact->updated_at)?->toDateTimeString(),
            ],
            'activity' => $activity->map(fn (Activity $item) => ActivityPresenter::forTimeline($item))->values(),
            'can' => [
                'update' => $request->user()->can('update', $contact),
                'delete' => $request->user()->can('delete', $contact),
            ],
        ]);
    }

    public function edit(ClientContact $contact): Response
    {
        $this->authorize('update', $contact);

        return Inertia::render('Contacts/Edit', [
            'contact' => [
                ...$contact->toArray(),
                'contact_type' => $contact->contact_type?->value,
            ],
            'clients' => $this->clientOptions(),
        ]);
    }

    public function update(UpdateClientContactRequest $request, ClientContact $contact): RedirectResponse
    {
        $contact->update($request->validated());

        activity('contacts')
            ->performedOn($contact)
            ->causedBy($request->user())
            ->event('updated')
            ->withProperties(['email' => $contact->email])
            ->log('Client contact updated');

        return redirect()->route('contacts.show', $contact)->with('success', 'Contact updated successfully.');
    }

    public function destroy(Request $request, ClientContact $contact): RedirectResponse
    {
        $this->authorize('delete', $contact);

        $contact->delete();

        activity('contacts')
            ->performedOn($contact)
            ->causedBy($request->user())
            ->event('archived')
            ->withProperties(['email' => $contact->email])
            ->log('Client contact archived');

        return redirect()->route('contacts.index')->with('success', 'Contact archived successfully.');
    }

    public function toggleActive(Request $request, ClientContact $contact): RedirectResponse
    {
        $this->authorize('update', $contact);

        $contact->update(['is_active' => !$contact->is_active]);

        activity('contacts')
            ->performedOn($contact)
            ->causedBy($request->user())
            ->event($contact->is_active ? 'reactivated' : 'deactivated')
            ->withProperties(['email' => $contact->email])
            ->log($contact->is_active ? 'Client contact reactivated' : 'Client contact deactivated');

        return back()->with('success', $contact->is_active ? 'Contact reactivated successfully.' : 'Contact deactivated successfully.');
    }

    private function clientOptions(): array
    {
        return ClientCompany::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (ClientCompany $client) => ['id' => $client->id, 'name' => $client->name])
            ->all();
    }
}
