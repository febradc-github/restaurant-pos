<?php

namespace Database\Factories;

use App\Enums\TableShape;
use App\Models\Table;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Table>
 */
class TableFactory extends Factory
{
    protected $model = Table::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'label' => 'Table '.fake()->unique()->numberBetween(1, 999),
            'shape' => fake()->randomElement(TableShape::cases()),
            'capacity' => fake()->numberBetween(2, 8),
            'x' => fake()->randomFloat(2, 0, 1000),
            'y' => fake()->randomFloat(2, 0, 1000),
            'width' => fake()->randomFloat(2, 40, 200),
            'height' => fake()->randomFloat(2, 40, 200),
        ];
    }
}
