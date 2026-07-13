---
type: file
tags: [code/frontend]
aliases: ["src/types/menu.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-api-menu-ts]]", "[[src-components-menumanager-tsx]]", "[[laravel-decimal-json-serialization-gotcha]]", "[[US-4]]"]
sources: []
---

# src/types/menu.ts

TypeScript types for menu domain. Category: { id, name }. MenuItem: { id, name, price (string), category_id, available }.

**Critical:** MenuItem.price is typed as `string`, not number, because Laravel's decimal:2 cast serializes to JSON as fixed-point string (e.g., "12.50"). This avoids lossy round-trip through JavaScript number.

## Exports
- `Category` interface
- `MenuItem` interface

## Imports
- TypeScript built-ins