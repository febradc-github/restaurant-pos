<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class KitchenClockController extends Controller
{
    /**
     * PIN-based clock-in/clock-out for Kitchen (C-12). Deliberately outside
     * auth:sanctum -- unlike Owner/Cashier/Server, Kitchen never logs in and
     * no Sanctum token is ever created or required here. A PIN identifies
     * the employee and, on every submission, toggles their attendance: no
     * open time_entries row clocks them in, an open one clocks them out.
     *
     * An unrecognized or malformed PIN gets the same generic 422 either
     * way -- the message never reveals whether the PIN just doesn't match
     * any Kitchen employee or was invalid in some other way, so it can't be
     * used to enumerate which PINs exist.
     */
    public function clock(Request $request): JsonResponse
    {
        $data = $request->validate([
            'pin' => ['required', 'string'],
        ]);

        $user = User::where('role', UserRole::Kitchen)
            ->where('pin', $data['pin'])
            ->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'pin' => 'Invalid PIN.',
            ]);
        }

        $openEntry = TimeEntry::where('user_id', $user->id)
            ->whereNull('clock_out')
            ->latest('clock_in')
            ->first();

        if ($openEntry) {
            $openEntry->update(['clock_out' => now()]);
            $action = 'clocked_out';
            $timeEntry = $openEntry->fresh();
        } else {
            $timeEntry = TimeEntry::create([
                'user_id' => $user->id,
                'role' => UserRole::Kitchen,
                'clock_in' => now(),
            ]);
            $action = 'clocked_in';
        }

        return response()->json([
            'action' => $action,
            'employee' => [
                'id' => $user->id,
                'name' => $user->name,
            ],
            'time_entry' => $timeEntry,
        ]);
    }
}
