---
type: process
tags: [backend]
aliases: []
created: 2026-07-16
updated: 2026-07-16
related: ["[[frontend-src-types-order-ts]]"]
sources: []
---

# Check Eloquent Serialization Before Assuming Backend Change Needed

Recurring pattern across this epic (C-35 through C-38): a "needs backend change" assumption turned out to be false on inspection of actual Eloquent model serialization.

**C-38 example**: Order type needed `created_at` field. Assumed backend change required. Instead: Eloquent's default toArray()/model serialization already includes created_at/updated_at timestamps since Order.php has no `$hidden`/`$visible` restricting them. The field was already being sent over the wire; this was a TypeScript type sync only.

**Before filing a backend ticket**, check:
- Does the model have a `$hidden` array restricting fields?
- Does the model have a `$visible` array restricting fields?
- Is an explicit Resource class being used instead of raw model->toArray()?
- If none of these, Eloquent serializes everything by default.

This Laravel backend's models are unusually unrestricted, so many "looks like it needs backend work" assumptions fail on inspection.
