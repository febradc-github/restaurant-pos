---
type: domain
tags: [code/frontend]
aliases: ["antd Radio.Button pointer-events:none click caveat"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-checkout-tsx]]", "[[src-components-checkout-test-tsx]]", "[[US-7]]", "[[US-17]]"]
sources: []
---

# antd Radio.Button: pointer-events:none testing caveat

Ant Design's `Radio.Button` component renders its native `<input>` with `pointer-events: none` (set by antd's own stylesheet), relying on label-click delegation for the visual button appearance.

In tests using Testing Library / `userEvent.click`, you must target the visible label text/span of the radio button, not the element with `role="radio"` itself. Clicking the radio role element directly throws a "pointer-events: none" error in jsdom, preventing the interaction from completing.

**Workaround in tests:** Query by label text or aria-label and click the visible span/text node. Example:
```javascript
// ❌ Wrong (hits pointer-events:none input):
userEvent.click(screen.getByRole('radio', { name: /cash/ }));

// ✓ Correct (hits the visible label):
userEvent.click(screen.getByText(/cash/));
```

Applies to any `Radio.Group` with `optionType="button"` in a jsdom test environment (Vitest, Jest). Discovered in C-17's `Checkout.test.tsx` when rebuilding the payment-method selector.
