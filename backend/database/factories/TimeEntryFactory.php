<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TimeEntry>
 */
class TimeEntryFactory extends Factory
{
    protected $model = TimeEntry::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->cashier(),
            'role' => UserRole::Cashier,
            'clock_in' => now(),
            'clock_out' => null,
            'auto_closed' => false,
        ];
    }

    /**
     * Indicate that the entry has already been clocked out.
     */
    public function clockedOut(): static
    {
        return $this->state(fn (array $attributes) => [
            'clock_out' => now(),
        ]);
    }
}
