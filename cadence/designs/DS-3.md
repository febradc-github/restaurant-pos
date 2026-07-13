---
type: design
tags: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-3]]", "[[DS-1]]"]
sources: []
---

# C-3: Table Layout Editor -- Design

## Parent
Part of [[EP-1]] -- see [[DS-1]] for the umbrella rationale.

## Problem
The owner needs to configure the restaurant's actual floor plan -- table positions, shapes, sizes, and seating capacities -- so that Order Taking (see [[US-6]]) has real tables to assign orders to, reflecting the specific dining room rather than a generic numbered list.

## Approach
Build a drag-and-drop canvas (React) where the Owner places, moves, resizes, and deletes tables. Each table has a shape (e.g. round, square, rectangular), a size, and a seat capacity, stored in PostgreSQL. Only the Owner role (per [[US-2]]) can edit the layout.

## Acceptance criteria
- Owner can access a drag-and-drop canvas representing the restaurant floor.
- Owner can add, move, resize, and delete tables on the canvas.
- Tables support different shapes and configurable seat capacity.
- The layout persists and reloads correctly (survives a page refresh or server restart).
- Non-Owner roles cannot edit the layout.

## Estimate
5 points

## Assignee
claude
