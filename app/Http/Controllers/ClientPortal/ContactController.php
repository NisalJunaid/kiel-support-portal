<?php

namespace App\Http\Controllers\ClientPortal;

use App\Http\Controllers\Controller;
use App\Models\ClientContact;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function index(Request $request): Response
    {
        $profile = $request->user()->clientUserProfile;
        abort_unless($profile, 403);

        $this->authorize('viewAny', ClientContact::class);

        $contacts = ClientContact::query()
            ->where('client_company_id', $profile->client_company_id)
            ->orderBy('full_name')
            ->get(['id', 'full_name', 'title', 'email', 'phone', 'is_active'])
            ->map(fn (ClientContact $contact) => [
                'id' => $contact->id,
                'full_name' => $contact->full_name,
                'title' => $contact->title,
                'email' => $contact->email,
                'phone' => $contact->phone,
                'is_active' => (bool) $contact->is_active,
            ]);

        return Inertia::render('ClientPortal/Contacts/Index', [
            'contacts' => $contacts,
        ]);
    }
}
