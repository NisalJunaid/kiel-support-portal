<?php

namespace App\Models;

use App\Enums\AssetCriticality;
use App\Enums\AssetStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Asset extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'client_company_id',
        'parent_asset_id',
        'asset_type_id',
        'name',
        'asset_code',
        'service_category',
        'status',
        'environment',
        'criticality',
        'assigned_staff_id',
        'start_date',
        'renewal_date',
        'end_date',
        'vendor',
        'notes',
        'meta',
    ];

    protected $casts = [
        'status' => AssetStatus::class,
        'criticality' => AssetCriticality::class,
        'start_date' => 'date',
        'renewal_date' => 'date',
        'end_date' => 'date',
        'meta' => 'array',
    ];

    public function clientCompany(): BelongsTo
    {
        return $this->belongsTo(ClientCompany::class);
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(AssetType::class, 'asset_type_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_asset_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_asset_id');
    }

    public function assignedStaff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_staff_id');
    }
}
