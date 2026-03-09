<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class PlaceholderController extends Controller
{
    public function __invoke(string $module): Response
    {
        return Inertia::render('Placeholder/Index', [
            'module' => ucfirst($module),
        ]);
    }
}
