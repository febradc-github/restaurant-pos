<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Enums\TableShape;
use App\Http\Controllers\Controller;
use App\Models\Table;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TableController extends Controller
{
    /**
     * List every table on the floor-plan layout, each annotated with an
     * `is_occupied` flag (C-37): true when the table has an open order
     * (Pending or Ready) against it, false otherwise -- Paid and Cancelled
     * orders don't count. Computed here rather than on the frontend so
     * every consumer of this endpoint (Owner's table grid, and any future
     * one) shares the same definition of "occupied".
     *
     * Open to anyone -- Server and Kitchen views need to render the layout
     * without a login, per the "no-auth device" access pattern.
     */
    public function index(): JsonResponse
    {
        $tables = Table::withExists([
            'orders as is_occupied' => fn ($query) => $query->whereIn('status', [
                OrderStatus::Pending,
                OrderStatus::Ready,
            ]),
        ])->get();

        return response()->json($tables);
    }

    /**
     * Add a table to the layout. Owner-only.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());

        $table = Table::create($data);

        return response()->json($table, 201);
    }

    /**
     * Move, resize, reshape, relabel, or recapacitate a table. Owner-only.
     */
    public function update(Request $request, Table $table): JsonResponse
    {
        $data = $request->validate($this->rules(sometimes: true));

        $table->update($data);

        return response()->json($table);
    }

    /**
     * Remove a table from the layout. Owner-only.
     */
    public function destroy(Table $table): JsonResponse
    {
        $table->delete();

        return response()->json(null, 204);
    }

    /**
     * Validation rules shared by store and update.
     *
     * @return array<string, array<mixed>>
     */
    private function rules(bool $sometimes = false): array
    {
        $wrap = fn (array $rules) => $sometimes ? array_merge(['sometimes'], $rules) : $rules;

        return [
            'label' => $wrap(['required', 'string', 'max:255']),
            'shape' => $wrap(['required', Rule::enum(TableShape::class)]),
            'capacity' => $wrap(['required', 'integer', 'min:1']),
            'zone' => ['nullable', 'string', 'max:255'],
            'x' => $wrap(['required', 'numeric']),
            'y' => $wrap(['required', 'numeric']),
            'width' => $wrap(['required', 'numeric', 'min:1']),
            'height' => $wrap(['required', 'numeric', 'min:1']),
        ];
    }
}
