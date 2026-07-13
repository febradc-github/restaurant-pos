---
type: file
tags: [code/backend]
aliases: ["app/Models/OrderItem.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-models-order-php]]"]
sources: []
---

# app/Models/OrderItem.php

Eloquent model for individual line items within an order.

## Exports
- `order()` -- belongsTo Order
- `menuItem()` -- belongsTo MenuItem

## Design

Each order item references a specific menu item and a quantity (unsigned int, default 1). The order/menuItem relationships enable eager loading and natural cascade behavior when an order is deleted.
