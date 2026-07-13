---
type: design
tags: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-6]]", "[[DS-1]]", "[[DS-3]]", "[[DS-4]]"]
sources: []
---

# C-6: Order Taking & Kitchen Display -- Design

## Parent
Part of [[EP-1]] -- see [[DS-1]] for the umbrella rationale.

## Problem
Servers need to record what a table ordered and get it to the kitchen immediately, without a login step slowing them down, and the kitchen needs to see incoming orders live rather than periodically checking.

## Approach
Server selects a table (from the layout built in [[US-3]]) and adds menu items (from [[US-4]]) to an order. Submitting the order writes it to PostgreSQL and pushes it over a Laravel Reverb WebSocket channel to the Kitchen Display, which shows it live. Kitchen marks items/orders ready. On reconnect after a network drop, the Kitchen Display fetches any orders it missed from the database, so durability comes from the DB write rather than the WebSocket delivery.

## Acceptance criteria
- Server can select a table and add menu items to an order, without logging in.
- Submitting an order writes it to the database and pushes it in real time to the Kitchen Display.
- Kitchen Display shows incoming orders live, without polling or manual refresh.
- Kitchen can mark an order or order item as ready/done.
- If the Kitchen Display reconnects after a network drop, it fetches and displays any orders it missed.

## Estimate
6 points

## Assignee
claude
