<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SlaPlan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'response_minutes',
        'resolution_minutes',
        'business_hours',
        'escalation_rules',
    ];

    protected $casts = [
        'response_minutes' => 'integer',
        'resolution_minutes' => 'integer',
        'business_hours' => 'array',
        'escalation_rules' => 'array',
    ];

    public function clients(): HasMany
    {
        return $this->hasMany(ClientCompany::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }
}
