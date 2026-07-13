<?php

namespace App\Enums;

/**
 * Where an order stands in the kitchen/checkout workflow.
 *
 * Pending and Ready are C-6's kitchen states -- the Kitchen Display's
 * reconnect-catch-up fetch asks for everything not yet ready. Paid and
 * Cancelled are C-7's checkout states: Paid once the Cashier confirms
 * payment was received, Cancelled if the order is scrapped instead.
 * Course/timing sequencing and post-ready states (e.g. "served") remain out
 * of scope.
 */
enum OrderStatus: string
{
    case Pending = 'pending';
    case Ready = 'ready';
    case Paid = 'paid';
    case Cancelled = 'cancelled';
}
