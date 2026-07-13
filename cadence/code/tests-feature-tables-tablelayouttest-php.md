---
type: file
tags: [code/backend]
aliases: ["tests/Feature/Tables/TableLayoutTest.php"]
created: 2026-07-14
updated: 2026-07-14
related: ["app-http-controllers-api-tablecontroller-php", "database-factories-tablefactory-php", "[[US-3]]"]
sources: []
---

# tests/Feature/Tables/TableLayoutTest.php

Feature test suite for table CRUD operations. 13 tests covering: index (public access), store/update/destroy (auth + role:owner gate), shape enum serialization, position/size field validation, 404s on missing resources.

## Exports
- 13 feature test methods for TableController endpoints