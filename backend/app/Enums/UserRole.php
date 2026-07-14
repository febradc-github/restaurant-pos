<?php

namespace App\Enums;

/**
 * The set of user roles.
 *
 * Owner, Cashier, and (since C-11) Server are modeled as authenticated
 * users who log in with a password and get a Sanctum token. Kitchen (since
 * C-12) also has a `users` row -- one per employee -- but never logs in and
 * never gets a token; it's identified solely by the unique PIN on the
 * user's `pin` column, submitted to a dedicated no-auth clock-in/out
 * endpoint.
 */
enum UserRole: string
{
    case Owner = 'owner';
    case Cashier = 'cashier';
    case Server = 'server';
    case Kitchen = 'kitchen';
}
