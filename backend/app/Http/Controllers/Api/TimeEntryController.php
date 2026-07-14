<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\TimeEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class TimeEntryController extends Controller
{
    /**
     * List time entries, optionally filtered by user_id, role, and a
     * clock_in date range (from/to). Owner-only.
     *
     * This is a pure data/query surface -- no aggregation or reporting --
     * for the not-yet-built Owner analytics dashboard epic to consume.
     * Every row's auto_closed status (C-13) is included so that epic can
     * distinguish a forgotten clock-out from a normal one.
     */
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user_id' => ['sometimes', 'integer'],
            'role' => ['sometimes', Rule::enum(UserRole::class)],
            'from' => ['sometimes', 'date'],
            'to' => ['sometimes', 'date'],
        ]);

        $query = TimeEntry::query();

        if (isset($data['user_id'])) {
            $query->forUser($data['user_id']);
        }

        if (isset($data['role'])) {
            $query->forRole($data['role']);
        }

        // "to" is a calendar date inclusive of its whole day, not just its
        // midnight instant -- an entry clocked in at 18:00 on the "to" date
        // must still match.
        $query->clockedInBetween(
            $data['from'] ?? null,
            isset($data['to']) ? Carbon::parse($data['to'])->endOfDay() : null,
        );

        return response()->json($query->get());
    }
}
