---
type: domain
tags: [backend/database]
aliases: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-5]]", "[[US-6]]", "[[app-models-inventoryitem-php]]"]
sources: []
---

# C-6: Order Taking & Kitchen Display — Inventory Decrement Integration

C-5 (Inventory Tracking) defines the contract for C-6 to consume inventory when orders are placed.

**For each linked InventoryItem per order line, call once:**

```php
$inventoryItem->decrementStock(int $quantity): void
```

The quantity is: `pivot.quantity_required × ordered_quantity`

**Do not duplicate the availability resync logic.** The decrementStock() method fires an `updated` event that automatically calls syncAvailability() on all linked menu items. The auto-resync is baked in — calling it again wastes resources.

**Automatic behavior you get for free:**
- Stock is clamped to zero (never negative)
- When any linked inventory item reaches zero, its menu items are flagged unavailable
- Menu items with no inventory links are untouched

See [[app-models-inventoryitem-php]] for method signature and [[app-models-menuitem-php]] for syncAvailability() behavior.
