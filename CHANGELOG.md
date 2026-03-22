# Changelog

## 0.4.0 - 2026-03-22

### Breaking

- **`strict`** and **`recommended`** are now **TypeScript-only** (`strict-core` + `strict-runtime` + `strict-tests`). They no longer pull in Drizzle, Next/React, or Effect rules by default.
- If you relied on the previous all-in-one preset, extend **`strict-full`** instead, or add **`strict-drizzle`**, **`strict-web`** / **`strict-next`**, and **`effect-observability`** as needed.

### Added

- **`strict-full`**: previous default `strict` bundle (strict-ts + drizzle + web + effect observability).
- **`strict-ts`**, **`strict-next`**, **`strict-ts-boundaries`**, **`typescript-hard-mode-boundaries-only`**, **`recommended-ts`**.
- **`strict-core`** file-scoped overrides for tests, scripts/config, and UI trees (magic numbers, line length, complexity, console).

### Changed

- **`strict-effect`** now extends **`strict-full`** (keeps the old combined stack for consumers who used that entry).

## 0.2.0 - 2026-03-19

### Added

- Expand strict anti-slop baseline with additional custom rules and preset coverage.
- Broaden `strict`, `strict-core`, and `strict-tests` preset behavior around anti-slop and quality guardrails.

### Fixed

- Improve anti-slop false-positive heuristics to reduce noise in rule reporting.

