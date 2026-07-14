---
type: domain
tags: [code/frontend]
aliases: ["getByLabelText regex substring matching", "Testing Library regex text matching"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-ordertaking-tsx]]", "[[US-18]]"]
sources: []
---

# Testing Library: getByLabelText regex matches are substring-based

React Testing Library's `getByLabelText(regex)` performs substring matching on the regex, not exact matching. This is a gotcha when a control's label text is a substring of a sibling control's label.

**Example trap:** A quantity stepper with input label "Burger quantity" has sibling buttons "Increase Burger quantity" and "Decrease Burger quantity". Using `/burger quantity/i` as a regex to target the input will also match the button labels because the regex is substring-based.

**Fix:** Anchor the regex with start (`^`) and end (`$`) anchors for exact matching: `/^burger quantity$/i`. This ensures the regex matches only the exact label text, not substrings within longer labels.

**Applies to:** OrderTaking component (C-18) uses this pattern in tests to unambiguously target quantity input labels without matching the stepper buttons.
