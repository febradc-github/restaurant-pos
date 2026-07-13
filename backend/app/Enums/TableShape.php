<?php

namespace App\Enums;

/**
 * The set of shapes a floor-plan table can be drawn as on the layout canvas.
 */
enum TableShape: string
{
    case Round = 'round';
    case Square = 'square';
    case Rectangular = 'rectangular';
}
