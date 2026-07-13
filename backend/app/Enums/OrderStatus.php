<?php

namespace App\Enums;

/**
 * Where an order stands in the kitchen workflow.
 *
 * Only two states exist -- Pending (not yet ready) and Ready (done) --
 * because that's the only distinction C-6 needs: the Kitchen Display's
 * reconnect-catch-up fetch asks for everything not yet ready. Course/timing
 * sequencing and post-ready states (e.g. "served") are explicitly out of
 * scope for this ticket.
 */
enum OrderStatus: string
{
    case Pending = 'pending';
    case Ready = 'ready';
}
