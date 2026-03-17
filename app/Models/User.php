<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use App\Support\Roles;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'theme_mode',
        'avatar_path',
    ];

    public function clientUserProfile(): HasOne
    {
        return $this->hasOne(ClientUserProfile::class);
    }

    public function isClientUser(): bool
    {
        return $this->hasRole(Roles::CLIENT_USER);
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'theme_mode',
        'remember_token',
    ];

    public function getAvatarUrlAttribute(): ?string
    {
        if (! $this->avatar_path) {
            return null;
        }

        return Storage::disk('public')->url($this->avatar_path);
    }

    public function initials(): string
    {
        return (string) str($this->name)
            ->explode(' ')
            ->filter()
            ->map(fn (string $part) => mb_substr($part, 0, 1))
            ->take(2)
            ->implode('');
    }

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    public function requestedTickets(): HasMany
    {
        return $this->hasMany(Ticket::class, "requester_user_id");
    }

    public function assignedTickets(): HasMany
    {
        return $this->hasMany(Ticket::class, "assigned_user_id");
    }

    public function ticketMessages(): HasMany
    {
        return $this->hasMany(TicketMessage::class);
    }

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'theme_mode' => 'string',
    ];
}
