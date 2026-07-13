<?php

namespace App\Enums;

/**
 * The set of authenticated user roles.
 *
 * Only Owner and Cashier are modeled as authenticated users -- Server and
 * Kitchen are device-level, unauthenticated access patterns and have no
 * corresponding row in the users table.
 */
enum UserRole: string
{
    case Owner = 'owner';
    case Cashier = 'cashier';
}
