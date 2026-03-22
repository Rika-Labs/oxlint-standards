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

- **`strict-effect`** now extends **`strict-full`** (same combined stack under that preset name).

### Packaging

- **`CHANGELOG.md`** included in npm **`files`**.

### Documentation

- README: preset strategy, examples for **`strict-ts`** / **`strict-full`**, threshold overrides, and migration notes for consumers moving from the old all-in-one **`strict`**.

## 0.3.0 - 2026-03-20

### Removed

- Nine built-in rules that targeted legacy or redundant patterns: CommonJS/AMD imports, webpack loader syntax, Node CJS-only APIs, **`eslint/no-throw-literal`** (covered by **`typescript/only-throw-error`**), **`oxc/no-const-enum`**, **`typescript/no-unsafe-enum-comparison`**. See [#7](https://github.com/Rika-Labs/oxlint-standards/pull/7).

## 0.2.2 - 2026-03-20

### Fixed

- Build plugin **`dist`** output for **git-based** installs (`prepare`), so `file:` / git dependencies resolve the compiled plugin.

## 0.2.1 - 2026-03-20

### Fixed

- **Strict Effect** preset linting in helper files.

## 0.2.0 - 2026-03-19

### Added

- Expand **strict anti-slop** baseline with additional custom rules and preset coverage ([#4](https://github.com/Rika-Labs/oxlint-standards/pull/4)).
- **Drizzle**, **Next App Router**, and **Effect** guardrails in **`strict`** ([#5](https://github.com/Rika-Labs/oxlint-standards/pull/5)).
- Broaden **`strict`**, **`strict-core`**, and **`strict-tests`** preset behavior around anti-slop and quality guardrails.

### Fixed

- Tighten anti-slop false-positive heuristics ([#4](https://github.com/Rika-Labs/oxlint-standards/pull/4)).

## 0.1.0 - 2026-03-19

### Added

- Initial **`@rikalabs/oxlint-standards`**: **25 custom rules** across anti-slop, Effect discipline, and TS boundaries, plus shared presets ([#1](https://github.com/Rika-Labs/oxlint-standards/pull/1), [#2](https://github.com/Rika-Labs/oxlint-standards/pull/2)).
- **GitHub Actions** CI and **npm publish** workflow (including prerelease dist-tags).
