---
type: architecture
tags: [backend, code/backend]
aliases: []
created: 2026-07-14
updated: 2026-07-15
related: ["[[app-http-controllers-api-restockcontroller-php]]", "[[app-models-inventoryitem-php]]", "[[EP-23]]", "[[US-24]]", "[[US-25]]"]
sources: []
---

# Live-Computed Suggestions vs. Scheduled Snapshots

## Decision

Owner analytics dashboard computes inventory reorder suggestions live on every dashboard load, without scheduled jobs, persistent history, or snapshot tables. Suggested reorder threshold = trailing-30-day average daily consumption (per ingredient via `menu_item_inventory_item` pivot `quantity_required`).

## Pattern

Each dashboard view triggers a fresh aggregation query over `OrderItem` and `MenuItem` for the last 30 days of Paid orders, computing per-ingredient totals. The result is not persisted—next load recomputes. No scheduled background job mirrors the C-13 auto-close pattern.

## Implementation

**C-24** (Analytics): Sales-over-time and best-seller metrics use chainable `Order` scopes (scopePaid, scopePaidBetween) for live aggregation on every chart load.

**C-25** (Restock API): Inventory suggested threshold endpoint (GET /api/inventory-items/restock) computes per-ingredient suggestion on every request:
- Consumption summed via `menu_item_inventory_item.quantity_required` across all OrderItem on Paid orders with paid_at in trailing 30 days
- Suggested threshold = ceil(totalConsumedInTrailing30Days / 30), deliberately rounded up to err toward "enough to not run out"
- Owned by RestockController, paired with PATCH /api/inventory-items/{id}/threshold for manual override
- No caching, no stored snapshot, no scheduled job

## Rationale

**Simpler MVP:** Two dashboard charts (sales-over-time, best-seller ranking) do not justify a scheduled aggregation job, materialized views, or historical snapshots. Recomputing live keeps the feature self-contained and avoids background-job debugging.

**Acceptable latency:** Aggregations span ≤30 days and ≤1000 orders in typical restaurant context; query time is sub-second. Dashboard load time is not sensitive to this.

**Transparency:** Each load shows current trailing-30-day average; no stale snapshot confusion or versioning complexity.

**Future flexibility:** If reporting demands grow (e.g., multi-month trends, predictive ordering), upgrade to materialized views or scheduled snapshots without changing the dashboard code—just swap the query layer.

## Constraints

- Reorder thresholds reflect only Paid orders (OrderStatus::Paid). Pending/Cancelled orders are excluded.
- Threshold = average daily usage over last 30 days; no seasonal adjustment, no safety stock buffer (owner can adjust manually via PATCH endpoint)
- Query is not cached; every dashboard load recomputes. If needed, implement HTTP caching headers or query-level caching later.
