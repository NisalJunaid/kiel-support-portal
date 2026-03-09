<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClientCompany extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'legal_name',
        'client_code',
        'industry',
        'status',
        'website',
        'primary_email',
        'phone',
        'billing_address',
        'technical_address',
        'timezone',
        'notes',
        'onboarded_at',
        'account_manager_id',
    ];

    protected $casts = [
        'onboarded_at' => 'datetime',
    ];

    public function accountManager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'account_manager_id');
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(ClientContact::class);
    }

    public function clientUsers(): HasMany
    {
        return $this->hasMany(ClientUserProfile::class);
    }
}
