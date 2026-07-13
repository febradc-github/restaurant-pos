<?php

namespace App\Models;

use App\Enums\TableShape;
use Database\Factories\TableFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * A table on the restaurant's floor-plan layout: its shape, seat capacity,
 * and position/size on the canvas.
 */
#[Fillable(['label', 'shape', 'capacity', 'x', 'y', 'width', 'height'])]
class Table extends Model
{
    /** @use HasFactory<TableFactory> */
    use HasFactory;

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
