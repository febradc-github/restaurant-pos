<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * List every menu category.
     *
     * Open to anyone -- Server views need to render the menu without a
     * login, per the "no-auth device" access pattern.
     */
    public function index(): JsonResponse
    {
        return response()->json(Category::all());
    }

    /**
     * Add a category. Owner-only.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());

        $category = Category::create($data);

        return response()->json($category, 201);
    }

    /**
     * Rename a category. Owner-only.
     */
    public function update(Request $request, Category $category): JsonResponse
    {
        $data = $request->validate($this->rules(sometimes: true));

        $category->update($data);

        return response()->json($category);
    }

    /**
     * Remove a category. Owner-only.
     *
     * Rejected while any menu item still belongs to it -- deleting the
     * category out from under existing items would leave them orphaned.
     */
    public function destroy(Category $category): JsonResponse
    {
        if ($category->menuItems()->exists()) {
            abort(409, 'Cannot delete a category that still has menu items assigned to it.');
        }

        $category->delete();

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
        ];
    }
}
