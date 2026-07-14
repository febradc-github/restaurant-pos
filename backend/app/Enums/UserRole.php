<?php

namespace App\Enums;

/**
 * The set of authenticated user roles.
 *
 * Owner, Cashier, and (since C-11) Server are modeled as authenticated
 * users. Kitchen remains a device-level, unauthenticated access pattern
 * (PIN-based clock-in is a separate ticket, C-12) and has no corresponding
 * row in the users table.
 */
enum UserRole: string
{
    case Owner = 'owner';
    case Cashier = 'cashier';
    case Server = 'server';
}
