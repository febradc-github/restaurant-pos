---
type: file
tags: [code/frontend]
aliases: ["package.json"]
created: 2026-07-14
updated: 2026-07-15
related: ["[[vite-config-ts]]", "[[US-15]]", "[[US-6]]", "[[US-3]]", "[[US-26]]"]
sources: []
---

# package.json

Frontend project manifest. Testing tooling added in C-3 (vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom, @vitest/ui as devDependencies). WebSocket client dependencies added in C-6: laravel-echo and pusher-js (first realtime broadcast dependencies in the project). Routing and design-system dependencies added in C-15: react-router-dom, antd, @ant-design/icons. dayjs (^1.11.21) added explicitly as a direct dependency in C-26 (was present transitively via antd's DatePicker/RangePicker, but AnalyticsDashboard.tsx imports it directly for the RangePicker's value type and date presets, so declaring it explicitly avoids phantom-dependency issues).

## Exports
- Dependencies and devDependencies config
