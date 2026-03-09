<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClientCompanyRequest;
use App\Http\Requests\UpdateClientCompanyRequest;
use App\Models\ClientCompany;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientCompanyController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ClientCompany::class);

        $search = trim((string) $request->string('search'));

        $clients = ClientCompany::query()
            ->with('accountManager:id,name')
            ->when($search, function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('legal_name', 'like', "%{$search}%")
                        ->orWhere('client_code', 'like', "%{$search}%")
                        ->orWhere('primary_email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (ClientCompany $client) => [
                'id' => $client->id,
                'name' => $client->name,
                'client_code' => $client->client_code,
                'status' => $client->status,
                'primary_email' => $client->primary_email,
                'account_manager' => $client->accountManager?->name,
            ]);

        return Inertia::render('Clients/Index', [
            'clients' => $clients,
            'filters' => [
                'search' => $search,
            ],
            'can' => [
                'create' => $request->user()->can('create', ClientCompany::class),
                'update' => $request->user()->can('update', ClientCompany::class),
                'delete' => $request->user()->can('delete', ClientCompany::class),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', ClientCompany::class);

        return Inertia::render('Clients/Create', [
            'managers' => $this->accountManagers(),
        ]);
    }

    public function store(StoreClientCompanyRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $client = ClientCompany::create($data);

        activity('clients')
            ->performedOn($client)
            ->causedBy($request->user())
            ->event('created')
            ->withProperties(['client_code' => $client->client_code])
            ->log('Client company created');

        return redirect()->route('clients.show', $client)->with('success', 'Client company created successfully.');
    }

    public function show(Request $request, ClientCompany $client): Response
    {
        $this->authorize('view', $client);

        $client->load('accountManager:id,name,email');

        return Inertia::render('Clients/Show', [
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
                'legal_name' => $client->legal_name,
                'client_code' => $client->client_code,
                'industry' => $client->industry,
                'status' => $client->status,
                'website' => $client->website,
                'primary_email' => $client->primary_email,
                'phone' => $client->phone,
                'billing_address' => $client->billing_address,
                'technical_address' => $client->technical_address,
                'timezone' => $client->timezone,
                'notes' => $client->notes,
                'onboarded_at' => optional($client->onboarded_at)?->toDateString(),
                'account_manager' => $client->accountManager,
                'created_at' => $client->created_at?->toDateString(),
                'updated_at' => $client->updated_at?->toDateString(),
            ],
            'can' => [
                'update' => $request->user()->can('update', $client),
                'delete' => $request->user()->can('delete', $client),
            ],
        ]);
    }

    public function edit(Request $request, ClientCompany $client): Response
    {
        $this->authorize('update', $client);

        return Inertia::render('Clients/Edit', [
            'client' => $client,
            'managers' => $this->accountManagers(),
        ]);
    }

    public function update(UpdateClientCompanyRequest $request, ClientCompany $client): RedirectResponse
    {
        $client->update($request->validated());

        activity('clients')
            ->performedOn($client)
            ->causedBy($request->user())
            ->event('updated')
            ->withProperties(['client_code' => $client->client_code])
            ->log('Client company updated');

        return redirect()->route('clients.show', $client)->with('success', 'Client company updated successfully.');
    }

    public function destroy(Request $request, ClientCompany $client): RedirectResponse
    {
        $this->authorize('delete', $client);

        $client->delete();

        activity('clients')
            ->performedOn($client)
            ->causedBy($request->user())
            ->event('archived')
            ->withProperties(['client_code' => $client->client_code])
            ->log('Client company archived');

        return redirect()->route('clients.index')->with('success', 'Client company archived successfully.');
    }

    private function accountManagers(): array
    {
        return User::query()
            ->role(['super-admin', 'admin', 'staff', 'support-agent'])
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (User $user) => ['id' => $user->id, 'name' => $user->name])
            ->all();
    }
}
