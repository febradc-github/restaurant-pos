---
type: domain
tags: [backend/database]
aliases: ["decimal JSON serialization", "Laravel money fields"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-menuitem-php]]", "[[app-http-controllers-api-analyticscontroller-php]]", "[[analytics-api-response-format-decimal-string-convention]]", "[[src-types-menu-ts]]", "[[US-4]]", "[[US-24]]"]
sources: []
---

# Laravel decimal:X JSON serialization gotcha

Laravel's `decimal:X` Eloquent cast serializes to JSON as a fixed-point string (e.g., "12.50"), not a JavaScript number. This is intentional: it preserves decimal precision across JSON round-trips without lossy float arithmetic.

Frontend impact: any TypeScript type for a money/decimal field must type it as `string`, not `number`. Do not parse with parseFloat() or round-trip through arithmetic unless actually needed—it defeats the precision gain.

Applies to: MenuItem.price in C-4, and will recur in C-5 (Inventory), C-6 (Order Taking), C-7 (Checkout), and C-24 (Analytics API endpoints). Any future ticket touching money fields should follow this pattern.

Example:
- Backend: `MenuItem::create(['price' => '12.50'])` → JSON: `{\"price\": \"12.50\"}`
- Frontend type: `interface MenuItem { price: string }` not `price: number`
- Don't do: `parseFloat(item.price)` (rounds to 12.5, loses trailing zero); instead use string directly in display/forms, or use a decimal library if arithmetic is needed.

See [[analytics-api-response-format-decimal-string-convention]] for C-24 Analytics API specifics.
