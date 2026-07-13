<?php

namespace App\Models;

use Database\Factories\InventoryItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use InvalidArgumentException;

/**
 * A stock-tracked ingredient or supply (e.g. "Beef Patty", "Buns"). Linked
 * to one or more menu items via the menu_item_inventory_item pivot; when its
 * stock reaches zero, every menu item that requires it is automatically
 * flagged unavailable (see MenuItem::syncAvailability()).
 */
#[Fillable(['name', 'stock'])]
class InventoryItem extends Model
{
    /** @use HasFactory<InventoryItemFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'stock' => 'integer',
        ];
    }

    /**
     * The menu items that require this inventory item, with how many units
     * of it each one consumes per order.
     *
     * @return BelongsToMany<MenuItem, $this>
     */
    public function menuItems(): BelongsToMany
    {
        return $this->belongsToMany(MenuItem::class, 'menu_item_inventory_item')
            ->withPivot('quantity_required')
            ->withTimestamps();
    }

    /**
     * Decrement stock by the given quantity, clamped at zero. This is the
     * entry point future order-placement code (C-6) calls to consume stock:
     *
     *     $inventoryItem->decrementStock(int $quantity): void
     *
     * Stock never goes negative -- decrementing past zero just leaves it at
     * zero. Every linked menu item's availability is re-synced afterward
     * via the `updated` model event below, so this single call is all a
     * caller needs.
     */
    public function decrementStock(int $quantity): void
    {
        if ($quantity < 1) {
            throw new InvalidArgumentException('Decrement quantity must be a positive integer.');
        }

        $this->update(['stock' => max(0, $this->stock - $quantity)]);
    }

    /**
     * Whenever stock changes -- via decrementStock() or a direct owner
     * PATCH to /api/inventory-items/{id} -- re-sync the availability of
     * every menu item that requires this inventory item.
     */
    protected static function booted(): void
    {
        static::updated(function (InventoryItem $inventoryItem) {
            if ($inventoryItem->wasChanged('stock')) {
                foreach ($inventoryItem->menuItems()->get() as $menuItem) {
                    $menuItem->syncAvailability();
                }
            }
        });
    }
}
