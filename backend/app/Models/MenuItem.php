<?php

namespace App\Models;

use Database\Factories\MenuItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * An item the restaurant sells: its name, price, category, and whether it's
 * currently available to order (e.g. sold out).
 */
#[Fillable(['name', 'price', 'category_id', 'available'])]
class MenuItem extends Model
{
    /** @use HasFactory<MenuItemFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'available' => 'boolean',
        ];
    }

    /**
     * The category this item belongs to.
     *
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * The inventory items required to make this menu item, with how many
     * units of each one it consumes per order.
     *
     * @return BelongsToMany<InventoryItem, $this>
     */
    public function inventoryItems(): BelongsToMany
    {
        return $this->belongsToMany(InventoryItem::class, 'menu_item_inventory_item')
            ->withPivot('quantity_required')
            ->withTimestamps();
    }

    /**
     * Recompute `available` from linked inventory stock: unavailable if any
     * required inventory item is out of stock, available otherwise.
     *
     * Items with no linked inventory are left untouched -- untracked items
     * aren't auto-flipped and stay under the owner's manual control.
     */
    public function syncAvailability(): void
    {
        if (! $this->inventoryItems()->exists()) {
            return;
        }

        $available = ! $this->inventoryItems()->where('stock', 0)->exists();

        if ($this->available !== $available) {
            $this->update(['available' => $available]);
        }
    }
}
