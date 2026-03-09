<?php

namespace App\Models;

use App\Enums\ContactType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClientContact extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'client_company_id',
        'full_name',
        'title',
        'department',
        'email',
        'phone',
        'mobile',
        'contact_type',
        'escalation_level',
        'preferred_contact_method',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'contact_type' => ContactType::class,
        'is_active' => 'boolean',
        'escalation_level' => 'integer',
    ];

    public function clientCompany(): BelongsTo
    {
        return $this->belongsTo(ClientCompany::class);
    }

    public function clientUserProfiles(): HasMany
    {
        return $this->hasMany(ClientUserProfile::class, "contact_id");
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, "requester_contact_id");
    }
}
