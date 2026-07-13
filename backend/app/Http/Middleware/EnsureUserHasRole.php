<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Reject the request unless the authenticated user has one of the given roles.
     *
     * Usage: ->middleware('role:owner') or ->middleware('role:owner,cashier')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(401, 'Unauthenticated.');
        }

        if (! in_array($user->role->value, $roles, true)) {
            abort(403, 'This action is unauthorized for your role.');
        }

        return $next($request);
    }
}
