---
type: process
tags: [code/frontend, code/testing]
aliases: ["CSS regression testing in jsdom", "vitest layout test pattern"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[frontend-src-app-test-tsx]]", "[[frontend-src-components-OwnerPage-test-tsx]]"]
sources: []
---

# Vitest + jsdom Layout Regression Test Pattern

When testing layout sizing in this codebase's vitest+jsdom setup (which runs with `css: false`), real stylesheet rules never apply. This creates a trap for naive regression tests: a test that asserts on rendered text content or computed styles is meaningless for CSS-based bugs like text truncation, because jsdom never actually applies the truncation rule.

## The Problem

vitest.config.ts disables CSS processing (`css: false`), so:
- antd's `.ant-menu-title-content { text-overflow: ellipsis; overflow: hidden; }` never applies in tests
- Component `textContent` is always full-length, even when the bug is present
- A test like `expect(screen.getByText('Menu Management')).toBeInTheDocument()` passes even when the UI is visually truncated

## The Solution: Assert on Inline Styles

Test the component's *inline* `style.width` (or other dimension properties) instead, which antd's Layout.Sider always renders regardless of CSS processing:

```javascript
// BAD: Text-content test is meaningless in jsdom
expect(screen.getByText('Menu Management')).toBeInTheDocument();

// GOOD: Assert on the inline style that controls the sizing
const sider = screen.getByRole('button', { name: /collapse/i }).closest('[class*="Sider"]');
expect(sider).toHaveStyle({ width: '230px' });
```

This pattern is reusable for any future antd layout-sizing regression test in this codebase.

## Related Fixes

- [[frontend-src-components-OwnerPage-test-tsx]] uses this pattern for three C-34 regression tests (expanded width > 200px, collapsed width = 80px, label text present assertion only validates the component's internal state, not the truncation that's purely visual)
- [[frontend-src-app-test-tsx]] uses CSS content assertions via Vite's `?raw` suffix, which is an alternative pattern for pure stylesheet regression testing
