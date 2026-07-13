<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryItemController extends Controller
{
    /**
     * List every inventory item.
     *
     * Open to anyone -- same "no-auth device" access pattern as menu items
     * and categories.
     */
    public function index(): JsonResponse
    {
        return response()->json(InventoryItem::all());
    }

    /**
     * Add an inventory item. Owner-only.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());

        $inventoryItem = InventoryItem::create($data);

        return response()->json($inventoryItem, 201);
    }

    /**
     * Edit an inventory item -- including setting or adjusting stock via a
     * partial PATCH, e.g. {"stock": 12}. Owner-only.
     */
    public function update(Request $request, InventoryItem $inventoryItem): JsonResponse
    {
        $data = $request->validate($this->rules(sometimes: true));

        $inventoryItem->update($data);

        return response()->json($inventoryItem);
    }

    /**
     * Remove an inventory item. Owner-only.
     */
    public function destroy(InventoryItem $inventoryItem): JsonResponse
    {
        $inventoryItem->delete();

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
            'name' => $wrap(['required', 'string', 'max:255']),
            'stock' => $wrap(['required', 'integer', 'min:0']),
        ];
    }
}
