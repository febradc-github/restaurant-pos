---
type: domain
tags: [code/frontend]
aliases: ["antd v6 Space direction deprecated"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-checkout-tsx]]", "[[US-17]]"]
sources: []
---

# antd v6: Space component direction → orientation

Ant Design v6 deprecated the `direction` prop on the `Space` component in favor of the standard `orientation` prop.

**Migration:** Replace `direction="vertical"` with `orientation="vertical"` (same for `"horizontal"`). The old prop still works but triggers deprecation warnings.

Applies to all new frontend components using `Space` going forward. Already used in Checkout.tsx with `orientation="vertical"`.
