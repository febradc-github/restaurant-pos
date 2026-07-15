<?php

namespace App\Models;

use App\Enums\TableShape;
use Database\Factories\TableFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A table on the restaurant's floor-plan layout: its shape, seat capacity,
 * zone (C-37, e.g. "Patio"/"Bar"), and position/size on the canvas.
 */
#[Fillable(['label', 'shape', 'capacity', 'zone', 'x', 'y', 'width', 'height'])]
class Table extends Model
{
    /** @use HasFactory<TableFactory> */
    use HasFactory;

    /**
     * Every order ever placed for this table, occupied or not. Used by
     * TableController@index (C-37) to derive an `is_occupied` flag from
     * whether any of them are still open (Pending/Ready).
     *
     * @return HasMany<Order, $this>
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'shape' => TableShape::class,
            'capacity' => 'integer',
            'x' => 'float',
            'y' => 'float',
            'width' => 'float',
            'height' => 'float',
        ];
    }
}
