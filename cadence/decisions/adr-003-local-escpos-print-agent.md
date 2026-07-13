---
type: decision
tags: [backend, infrastructure]
aliases: ["ESC/POS print agent", "Receipt printing", "Cash drawer control"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[EP-1]]", "[[AR-POS-core]]", "[[AR-print-agent-polyglot]]", "[[US-8]]", "[[pos-launch-session-2026-07-14]]"]
---

# ADR-003: Local ESC/POS Print Agent Over Browser-Native Printing

**Decision:** Build a local print agent (separate small service) that accepts print requests and sends raw ESC/POS commands to thermal receipt printers; reject browser-native printing (window.print()).

## Context

The system must reliably print receipts and trigger the cash drawer via the thermal printer's ESC/POS command set. Browser-native printing was considered as the simpler alternative.

## Rationale

**Friction-free checkout:** window.print() forces a print dialog on every transaction. In a busy restaurant, clicking through dialogs for every order is unacceptable friction. A local agent eliminates the dialog.

**Full formatting control:** ESC/POS commands give precise control over receipt layout, margins, logo placement, and barcode encoding. Browser print stylesheets are printer-model-dependent and fragile.

**Reliable cash drawer:** Most thermal receipt printers support the ESC/POS "kick drawer" command. Browser printing + the "print job triggers drawer" trick (relying on CUPS or OS-level print-job detection) is unreliable and varies wildly by printer model, OS, and browser. Raw ESC/POS commands are deterministic.

**Decoupled from browser:** The print agent runs as a local HTTP service. Any device in the restaurant (owner's terminal, cashier's tablet, kitchen display) can POST a print request without worrying about browser print permissions, printer drivers, or OS quirks.

## Alternatives Rejected

**Browser-native printing (window.print()):** Simpler to code (no separate service), but adds per-transaction friction, fragile cash-drawer triggering, and loss of receipt formatting control.

## Implementation

See [[AR-print-agent-polyglot]] for architecture details and polyglot deployment implications.

## Revisit Trigger

Only if the restaurant switches to a printer model that does not support ESC/POS or if cloud-hosted SaaS variants require remote printing (different approach needed).
