<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => UserRole::Owner,
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the model is an Owner.
     */
    public function owner(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => UserRole::Owner,
        ]);
    }

    /**
     * Indicate that the model is a Cashier.
     */
    public function cashier(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => UserRole::Cashier,
        ]);
    }

    /**
     * Indicate that the model is a Server.
     */
    public function server(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => UserRole::Server,
        ]);
    }

    /**
     * Indicate that the model is a Kitchen employee, identified by PIN
     * rather than password (C-12). Accepts an explicit PIN so tests can
     * predict/control it -- a hardcoded default would collide across
     * multiple kitchen() users in the same test, tripping the unique
     * constraint on `pin`.
     */
    public function kitchen(?string $pin = null): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => UserRole::Kitchen,
            'pin' => $pin ?? fake()->unique()->numerify('######'),
        ]);
    }
}
