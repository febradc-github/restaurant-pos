---
type: file
tags: [code/backend]
aliases: ["app/Models/OrderItem.php"]
created: 2026-07-14
updated: 2026-07-16
related: ["[[app-models-order-php]]", "[[app-http-controllers-api-ordercontroller-php]]", "[[US-39]]"]
sources: []
---

# app/Models/OrderItem.php

Eloquent model for individual line items within an order.

## Exports
- `order()` -- belongsTo Order
- `menuItem()` -- belongsTo MenuItem

## Design

Each order item references a specific menu item and a quantity (unsigned int, default 1). The order/menuItem relationships enable eager loading and natural cascade behavior when an order is deleted.

## Changes (C-39)

Added `notes` to `#[Fillable]` attribute to support kitchen notes (nullable string, max 500 chars). Backend validation and persistence are handled by [[app-http-controllers-api-ordercontroller-php|OrderController.php]]. Front-end passes a single order-level note to all line items in the items array on submission.
