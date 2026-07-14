---
type: domain
tags: [code/frontend]
aliases: ["antd Alert role="status" override", "antd Alert hardcoded role"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-ordertaking-tsx]]", "[[US-18]]"]
sources: []
---

# antd Alert: role="alert" is hardcoded but can be overridden

Ant Design's `Alert` component hardcodes `role="alert"` as a default prop in its internal base props, but spreads the caller's `restProps` *after* that default. This means passing `role="status"` explicitly on an Alert will override the hardcoded `role="alert"`.

**Pattern:** Use this when a non-error Alert needs to read as `role="status"` to assistive tech instead of the more urgent `role="alert"`. Example: success confirmations should use `<Alert type="success" role="status" />` to indicate a status change rather than alerting the user to an urgent condition.

**Implementation detail:** Confirmed by reading `antd/es/alert/Alert.js` — the component sets `role: 'alert'` as part of its base props but spreads caller restProps afterward in the JSX, so explicit role props win.

**Applies to:** OrderTaking component (C-18) uses this pattern for success feedback.
