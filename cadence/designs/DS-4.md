---
type: design
tags: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-4]]", "[[DS-1]]"]
sources: []
---

# C-4: Menu Management -- Design

## Parent
Part of [[EP-1]] -- see [[DS-1]] for the umbrella rationale.

## Problem
The Owner needs to define and maintain what the restaurant sells -- items, categories, and pricing -- and mark items unavailable (e.g. sold out) without deleting them. This is what Servers select from when taking an order (see [[US-6]]) and what Inventory Tracking (see [[US-5]]) links against.

## Approach
Build Owner-facing CRUD screens for menu items (name, price, category, availability flag) and categories. Menu data is read by the Order Taking flow; availability changes take effect immediately for any new order.

## Acceptance criteria
- Owner can create, edit, and delete menu items, each with a name, price, and category.
- Owner can group items into categories.
- Owner can mark an item as available or unavailable.
- Menu changes are immediately reflected in what Servers see when taking an order.

## Estimate
3 points

## Assignee
claude
