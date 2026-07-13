---
type: design
tags: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-5]]", "[[DS-1]]", "[[DS-4]]"]
sources: []
---

# C-5: Inventory Tracking -- Design

## Parent
Part of [[EP-1]] -- see [[DS-1]] for the umbrella rationale.

## Problem
The Owner needs visibility into stock levels so the menu (see [[US-4]]) doesn't offer items the kitchen can't actually make, and so running low on an ingredient is caught before it becomes a problem mid-service.

## Approach
Track stock levels for inventory items in PostgreSQL, and link menu items to one or more inventory items. When a linked inventory item's stock reaches zero, the corresponding menu item is automatically flagged unavailable. Exact stock-deduction triggers (e.g. per order placed vs. manual adjustment only) are confirmed at spec time.

## Acceptance criteria
- Owner can set and adjust stock levels for inventory-tracked items.
- Menu items can be linked to one or more inventory items.
- When linked stock reaches zero, the corresponding menu item is automatically flagged unavailable.
- Stock levels decrease as orders are placed (exact deduction logic confirmed at spec time).

## Estimate
3 points

## Assignee
claude
