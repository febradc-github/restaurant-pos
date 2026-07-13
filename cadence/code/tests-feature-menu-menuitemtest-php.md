---
type: file
tags: [code/backend]
aliases: ["tests/Feature/Menu/MenuItemTest.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-http-controllers-api-menuitemcontroller-php]]", "[[US-4]]"]
sources: []
---

# tests/Feature/Menu/MenuItemTest.php

17 feature tests for MenuItemController: index with optional category filter, store/update/destroy (owner-gated), availability toggle via PATCH. All tests use MenuItemFactory.

## Exports
- Test class with setUp, test methods

## Imports
- MenuItemFactory
- Laravel testing traits
- Sanctum auth helpers