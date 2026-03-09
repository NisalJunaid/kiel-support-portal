<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientUserProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'client_company_id',
        'contact_id',
        'role_label',
        'can_view_all_company_tickets',
        'can_create_tickets',
        'can_view_assets',
        'can_manage_contacts',
    ];

    protected $casts = [
        'can_view_all_company_tickets' => 'boolean',
        'can_create_tickets' => 'boolean',
        'can_view_assets' => 'boolean',
        'can_manage_contacts' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function clientCompany(): BelongsTo
    {
        return $this->belongsTo(ClientCompany::class);
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(ClientContact::class, 'contact_id');
    }
}
