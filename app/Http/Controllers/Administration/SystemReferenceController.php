<?php

namespace App\Http\Controllers\Administration;

use App\Http\Controllers\Controller;
use App\Support\DomainReferenceCatalog;
use Inertia\Inertia;
use Inertia\Response;

class SystemReferenceController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Administration/SystemReference', [
            'domainReferences' => DomainReferenceCatalog::all(),
        ]);
    }
}
