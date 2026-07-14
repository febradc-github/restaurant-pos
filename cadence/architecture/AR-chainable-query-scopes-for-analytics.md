---
type: architecture
tags: [backend, code/backend]
aliases: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-order-php]]", "[[app-models-timeentry-php]]", "[[app-http-controllers-api-analyticscontroller-php]]", "[[tests-feature-analytics-analyticssalestest-php]]", "[[tests-feature-analytics-analyticsmenuitemstest-php]]", "[[EP-10]]", "[[EP-23]]", "[[US-24]]"]
sources: []
---

# Chainable Query Scopes for Analytics

## Pattern

Analytics and reporting queries over domain models reuse the chainable local-scope pattern established by `TimeEntry` in EP-10 rather than building one-off raw SQL or parameterized generic reporting endpoints. Scopes like `forUser()`, `forRole()`, and `clockedInBetween()` return fully-qualified Builder instances, enabling fluid composition without boilerplate.

## Application to Sales & Inventory Analytics (C-23)

- **Sales-over-time aggregation:** `Order::scopePaid()->scopePaidBetween()->groupByDay()->selectSalesMetrics()` (scopes return Builder, chaining works) — implemented in C-24
- **Best/worst-seller ranking:** `MenuItem::withSalesVolume()->withRevenue()->orderBy('quantity_sold')` (reusing MenuItem's relationships)
- **Inventory reorder suggestions:** `InventoryItem` has `suggestedReorderThreshold()` computed live from trailing-30-day average consumption via the pivot's `quantity_required`

Scopes remain local to their model; no separate generic "analytics builder" class. This keeps queries readable, testable in isolation, and aligned with the app's existing Eloquent conventions.

## Rationale

- **Composability:** Scopes chain naturally; future analytics queries compose existing scopes without duplication
- **No overengineering:** Defers a fully parameterized reporting endpoint until actual need (current queries: 2 chart types in C-24)
- **Consistency:** Mirrors the established TimeEntry pattern; new developers recognize the pattern immediately
- **Testability:** Each scope is testable in unit tests with controlled query builders

## Constraints

Scopes must return Builder or callable closures (not immediate collections). Aggregation logic (sum, count, group) lives in the query, not in post-fetch PHP loops.

## Implementation Details (C-24)

Order model gained two scopes:
- `scopePaid(Builder $query)` -- filters status = OrderStatus::Paid
- `scopePaidBetween(Builder $query, ?string $from, ?string $to)` -- filters paid_at within optional range (nullable-bounds style, either side omittable)

AnalyticsController uses these scopes to compute sales-over-time and best-seller metrics via Query Builder's groupBy() and aggregate functions.
