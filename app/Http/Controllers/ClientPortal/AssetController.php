<?php

namespace App\Http\Controllers\ClientPortal;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssetController extends Controller
{
    public function index(Request $request): Response
    {
        $profile = $request->user()->clientUserProfile;
        abort_unless($profile && $profile->can_view_assets, 403);

        $assets = Asset::query()
            ->with('type:id,name')
            ->where('client_company_id', $profile->client_company_id)
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Asset $asset) => [
                'id' => $asset->id,
                'name' => $asset->name,
                'asset_code' => $asset->asset_code,
                'status' => $asset->status?->value,
                'type' => $asset->type?->name,
                'environment' => $asset->environment,
            ]);

        return Inertia::render('ClientPortal/Assets/Index', [
            'assets' => $assets,
        ]);
    }
}
