---
type: architecture
tags: [backend, code/backend]
aliases: []
created: 2026-07-15
updated: 2026-07-15
related: ["[[app-http-controllers-api-analyticscontroller-php]]", "[[app-http-controllers-api-restockcontroller-php]]", "[[app-http-controllers-api-inventoryitemcontroller-php]]", "[[app-http-controllers-api-ordercontroller-php]]", "[[US-24]]", "[[US-25]]", "[[EP-23]]"]
sources: []
---

# Dedicated Controllers for Cross-Cutting Concerns

## Pattern

New cross-cutting analytics and operational concerns (analytics, restock/inventory threshold) get their own controller rather than being folded into the resource's original CRUD controller. The resource's core PATCH endpoint remains restricted to its primary domain (e.g., InventoryItemController::update() accepts only name/stock), and secondary concerns (threshold override, analytics queries) route through dedicated endpoints.

## Application

**C-24 (Analytics):** `AnalyticsController` owns sales-over-time and best-seller metrics, not `OrderController`.
- GET /api/analytics/sales
- GET /api/analytics/menu-items

**C-25 (Restock):** `RestockController` owns restock suggestions and threshold override, not `InventoryItemController`.
- GET /api/inventory-items/restock (suggested threshold computation)
- PATCH /api/inventory-items/{inventoryItem}/threshold (owner override setter)

InventoryItemController's PATCH /api/inventory-items/{id} deliberately accepts only name/stock, preventing accidental threshold changes through the resource's general update endpoint.

## Rationale

**Explicit surface:** "Who can change what" is clear at the route level. A client cannot sneak a threshold change through the general PATCH endpoint; the override is only available at RestockController::update().

**Separation of concerns:** Core resource CRUD remains stable; new features do not accumulate in the primary controller.

**Testability:** Each controller is smaller and easier to test in isolation.

**Future extensibility:** If other cross-cutting concerns emerge (budgeting, compliance audits), the pattern is established and scalable.

## Constraint

Cross-cutting controllers must follow the same middleware and validation patterns as core CRUD (auth:sanctum, role:owner gating, validated request input).
