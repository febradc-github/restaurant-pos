---
type: domain
tags: [code/frontend]
aliases: ["TableLayoutEditor and MenuManager auth wiring"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-3]]", "[[US-4]]", "[[US-7]]", "[[src-app-tsx]]"]
sources: []
---

# C-3 & C-4: Retroactive Auth Usability (Resolved by C-7)

TableLayoutEditor (C-3) and MenuManager (C-4) were built correctly with owner-gating logic from day one -- they checked `authToken` prop and disabled mutating controls when null. However, they had no way to obtain a real token: App.tsx had hardcoded `OWNER_AUTH_TOKEN = null` since C-3's completion, with a repeatedly-deferred TODO comment.

C-7 (Checkout, Payment Confirmation & Cancellation) retroactively resolved this as a scope addition by building the project's first login screen. No code in TableLayoutEditor or MenuManager needed to change -- only App.tsx's session-wiring did. Both components are now genuinely usable for the first time.

This is not a design flaw in C-3/C-4. It is correct architecture (gate on interface, not implementation) meeting reality (no login screen existed yet).
