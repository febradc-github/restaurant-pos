<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Roles whose login/logout is tracked by a time_entries row (C-11).
     * Owner is excluded -- attendance tracking only covers Cashier and
     * Server. Kitchen has no login at all (PIN-based clock-in is C-12).
     */
    private const TIME_TRACKED_ROLES = [UserRole::Cashier, UserRole::Server];

    /**
     * Authenticate an Owner, Cashier, or Server and issue a Sanctum API
     * token.
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'identifier' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['identifier'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'identifier' => __('auth.failed'),
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        if (in_array($user->role, self::TIME_TRACKED_ROLES, true)) {
            TimeEntry::create([
                'user_id' => $user->id,
                'role' => $user->role,
                'clock_in' => now(),
            ]);
        }

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * Revoke the token used to authenticate the current request.
     *
     * For a Cashier or Server, this also closes out the caller's open
     * time_entries row (C-11) -- the one their login created that hasn't
     * been clocked out yet.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if (in_array($user->role, self::TIME_TRACKED_ROLES, true)) {
            TimeEntry::where('user_id', $user->id)
                ->whereNull('clock_out')
                ->latest('clock_in')
                ->first()
                ?->update(['clock_out' => now()]);
        }

        $user->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }
}
