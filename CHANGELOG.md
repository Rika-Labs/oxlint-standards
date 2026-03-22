# Changelog

## 0.4.1 - 2026-03-22

### Added

- **`strict-tests-jest`**: opt-in Jest rules on top of Vitest-first **`strict-tests`**.
- [**CONTRIBUTING.md**](CONTRIBUTING.md) and npm **`files`** entry for it.
- [**examples/minimal-consumer/**](examples/minimal-consumer/) smoke project (`oxlint.smoke.json`) and CI **`smoke-consumer`** job.

### Changed

- **`strict-tests`** is **Vitest-first** (vitest + jsdoc + custom test rules); Jest plugin removed from the default preset.

### Documentation

- README: Vitest/Bun/Jest preset notes, ESLint migration pointer (**@oxlint/migrate**), simplified **`strict-effect`** description; removed 0.3.x upgrade section.

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

## 0.3.0 - 2026-03-20

### Removed

- Nine built-in rules that targeted legacy or redundant patterns: CommonJS/AMD imports, webpack loader syntax, Node CJS-only APIs, **`eslint/no-throw-literal`** (covered by **`typescript/only-throw-error`**), **`oxc/no-const-enum`**, **`typescript/no-unsafe-enum-comparison`**. See [#7](https://github.com/Rika-Labs/oxlint-standards/pull/7).

### Fixed

- Ensure the plugin build works for **git-based** installs (`prepare` / `dist`).
- **Strict Effect** preset linting in helper files.

## 0.2.0 - 2026-03-19

### Added

- Expand strict anti-slop baseline with additional custom rules and preset coverage.
- Broaden `strict`, `strict-core`, and `strict-tests` preset behavior around anti-slop and quality guardrails.

### Fixed

- Improve anti-slop false-positive heuristics to reduce noise in rule reporting.
