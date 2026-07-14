---
type: domain
tags: [code/frontend]
aliases: ["antd Select data-testid routing", "rc-component select DOM props"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-ordertaking-tsx]]", "[[US-18]]"]
sources: []
---

# antd Select: non-aria-* DOM props land on root wrapper, not listbox

Ant Design's `Select` (built on `@rc-component/select`) routes `aria-*` attributes to the inner combobox input element, but routes all other DOM props (e.g. `data-testid`, `className`) to the outer wrapper div. This distinction matters during testing: the portal-rendered dropdown listbox is separate from the select's closed/displayed state.

**Pattern:** When testing a Select, use `within(getByTestId('select-id'))` to scope within the select's *displayed* value without ambiguity against a still-mounting/unmounting dropdown listbox during animation. The `data-testid` lands on the outer wrapper, reliably capturing just the closed select.

**Implementation detail:** Confirmed by reading `@rc-component/select`'s `SelectInput/index.js` — it splits `domProps` into `ariaKeys` (routed to inner input) and everything else (routed to outer wrapper div).

**Applies to:** OrderTaking component (C-18) uses this pattern in tests for table Select.
