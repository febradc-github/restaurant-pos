---
type: process
tags: [backend/database, deployment]
aliases: []
created: 2026-07-15
updated: 2026-07-15
related: ["[[adr-001-postgresql-over-sqlite]]", "[[TK-27]]"]
sources: []
---

# Dev Machine SQLite Configuration Discrepancy

**Context:** This project is architected on PostgreSQL (see ADR-001), but running the DatabaseSeeder for TK-27 on the current dev machine revealed `config('database.default')` resolves to `sqlite` (backend/database/database.sqlite), not the `pos_dev` PostgreSQL database documented in prior sprint work and verified in tickets C-6 through C-10.

**Issue:** The seeder itself is DB-agnostic and functions correctly on both backends, but this discrepancy may surprise a future session running tests or seeders against this machine. The mismatch indicates `DB_CONNECTION` and/or `DB_DATABASE` environment variables are not configured as expected (the project's backend/.env or .env.local files are excluded by standing rule, so config lookup should not be done by reading those files directly).

**Next session:** If PostgreSQL is expected, check `config('database.default')` and available connections in `config/database.php`. If SQLite is a deliberate fallback for this environment, document why in a decision record.
