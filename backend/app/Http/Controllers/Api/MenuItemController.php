<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuItemController extends Controller
{
    /**
     * List menu items, optionally filtered to a single category.
     *
     * Open to anyone -- Server and Kitchen views need to render the menu
     * without a login, per the "no-auth device" access pattern. Reads
     * straight from the database on every request, so a GET immediately
     * after a mutation reflects the new state -- no caching layer sits in
     * between.
     */
    public function index(Request $request): JsonResponse
    {
        $query = MenuItem::query();

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->query('category_id'));
        }

        return response()->json($query->get());
    }

    /**
     * Add a menu item. Owner-only.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());

        $menuItem = MenuItem::create($data);

        return response()->json($menuItem, 201);
    }

    /**
     * Edit a menu item -- including toggling availability via a partial
     * PATCH, e.g. {"available": false}. Owner-only.
     */
    public function update(Request $request, MenuItem $menuItem): JsonResponse
    {
        $data = $request->validate($this->rules(sometimes: true));

        $menuItem->update($data);

        return response()->json($menuItem);
    }

    /**
     * Remove a menu item. Owner-only.
     */
    public function destroy(MenuItem $menuItem): JsonResponse
    {
        $menuItem->delete();

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
            'price' => $wrap(['required', 'numeric', 'min:0']),
            'category_id' => $wrap(['required', 'integer', 'exists:categories,id']),
            'available' => ['sometimes', 'boolean'],
        ];
    }
}
