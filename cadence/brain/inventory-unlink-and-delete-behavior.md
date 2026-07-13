---
type: domain
tags: [backend/database]
aliases: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-5]]", "[[app-models-menuitem-php]]", "[[app-models-inventoryitem-php]]", "[[app-http-controllers-api-menuiteминventoryitemcontroller-php]]"]
sources: []
---

# Inventory Unlink and Delete Behavior — Design Decisions

C-5 (Inventory Tracking) deliberately does NOT resync menu item availability in two scenarios. Not covered by acceptance criteria; documented here so it doesn't surprise future work.

## When unlinking an inventory item from a menu item:

MenuItemInventoryItemController::unlink() detaches the item but **does NOT call syncAvailability()**. The menu item's `available` flag persists at its last state (manual or automatic). This means:
- If a menu item was flagged unavailable because a linked inventory item was at zero, unlinking that item won't restore the menu item to available
- Owner can manually re-enable the menu item after unlinking, or leave it disabled

**Rationale:** Unclear whether an owner wants to make a formerly-inventory-tracked item available again (they might have other reasons to keep it disabled). Explicit action is safer.

## When deleting an inventory item entirely:

InventoryItemController::destroy() cascade-deletes pivot rows but **does NOT resync linked menu items' availability**. Example: if a zero-stock ingredient made a menu item unavailable, deleting the ingredient won't restore that menu item.

**Rationale:** Deletion is rare (usually items are archived, not deleted). The edge case cost of auto-resync isn't worth the complexity. Owner can manually re-enable menu items if needed.

## Related decisions

See also [[app-models-menuitem-php]]::syncAvailability() for the logic applied when availability IS synced.
