<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\TimeEntryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A single clock-in/clock-out attendance record for a Server or Cashier
 * (C-11). `role` snapshots the user's role at clock-in time, so a later
 * role change doesn't rewrite history. `auto_closed` is set by the
 * forgotten-clock-out job (C-13) -- always false for entries closed by a
 * normal logout.
 */
#[Fillable(['user_id', 'role', 'clock_in', 'clock_out', 'auto_closed'])]
class TimeEntry extends Model
{
    /** @use HasFactory<TimeEntryFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'role' => UserRole::class,
            'clock_in' => 'datetime',
            'clock_out' => 'datetime',
            'auto_closed' => 'boolean',
        ];
    }

    /**
     * The user this time entry belongs to.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to entries belonging to a given user.
     *
     * @param  Builder<TimeEntry>  $query
     * @return Builder<TimeEntry>
     */
    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to entries recorded under a given role.
     *
     * @param  Builder<TimeEntry>  $query
     * @return Builder<TimeEntry>
     */
    public function scopeForRole(Builder $query, UserRole|string $role): Builder
    {
        return $query->where('role', $role instanceof UserRole ? $role->value : $role);
    }
}
