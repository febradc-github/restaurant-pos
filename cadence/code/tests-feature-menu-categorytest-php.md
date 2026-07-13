---
type: file
tags: [code/backend]
aliases: ["tests/Feature/Menu/CategoryTest.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[app-http-controllers-api-categorycontroller-php]]", "[[US-4]]"]
sources: []
---

# tests/Feature/Menu/CategoryTest.php

13 feature tests for CategoryController: index (open access), store/update/destroy (owner-gated), 409 Conflict on destroy with items. All tests use CategoryFactory.

## Exports
- Test class with setUp, test methods

## Imports
- CategoryFactory
- Laravel testing traits
- Sanctum auth helpers