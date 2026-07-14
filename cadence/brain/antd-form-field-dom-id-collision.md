---
type: domain
tags: [code/frontend]
aliases: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-menumanager-tsx]]", "[[src-components-tablelayouteditor-tsx]]", "[[src-app-tsx]]", "[[antd-jsdom-test-gotcha]]", "[[US-16]]", "[[EP-14]]"]
sources: []
---

# Duplicate antd Form field DOM ids

Ant Design auto-generates a Form.Item's underlying DOM `id` from its field `name` alone, unless the parent Form itself has a `name` prop. If the parent Form has no `name`, then two separate Forms on the same page sharing a field name (e.g., both have a field named `name`) silently collide on `id="name"` in the DOM.

Consequences: `getByLabelText` (and real browsers' form submission) resolve to whichever field's id comes first in the DOM. User input can land in the wrong field with no error or warning.

**Fix/Rule**: Give every Form on a page with more than one form a distinct `name` prop, especially when their fields might share names.

**Example**: MenuManager rebuild (C-16) has two inline Forms (add-category form, add-item form). Both need `name="category-form"` and `name="item-form"` respectively, not shared unnamed Forms.

**Observed**: Silent field collisions in tests causing user input to route to wrong component during interaction testing. No thrown error or clear debugging signal.
