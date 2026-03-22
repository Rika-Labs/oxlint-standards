# @rikalabs/oxlint-standards

Strict, opinionated Oxlint defaults for TypeScript projects, with a full anti-slop baseline. Drizzle, Next App Router, and Effect guardrails are opt-in presets (`strict-full` or individual packs).

This package ships two things:

- shared Oxlint presets (`presets/*.json`)
- a custom JS plugin (`@rikalabs/*`) for rules Oxlint does not provide natively

## Goals

- enforce consistent standards across repositories
- prefer Oxlint built-ins first, custom rules second
- keep custom rules architecture-agnostic for open source reuse

## Install

```bash
bun add -d @rikalabs/oxlint-standards oxlint oxlint-tsgolint
```

`strict` depends on type-aware `typescript/*` rules, so consuming projects must enable root-level `options.typeAware`.

## Migrating from ESLint

Use [**@oxlint/migrate**](https://github.com/oxc-project/oxlint-migrate) to translate an existing ESLint configuration. Then add `extends` pointing at this package’s presets and declare `jsPlugins` in the root `.oxlintrc.json` as shown below.

## Use in `.oxlintrc.json`

```json
{
	"$schema": "./node_modules/oxlint/configuration_schema.json",
	"options": {
		"typeAware": true
	},
	"extends": ["./node_modules/@rikalabs/oxlint-standards/presets/strict.json"],
	"jsPlugins": ["@rikalabs/oxlint-standards/plugin"]
}
```

`jsPlugins` must be declared by the consuming project because Oxlint currently only merges `rules`, `plugins`, and `overrides` through `extends`, and `options.typeAware` must live in the root config.

## Preset strategy

- **`strict`** and **`recommended`** are the default: **TypeScript-only** strictness (`strict-core` + `strict-runtime` + `strict-tests`, same as **`strict-ts`**). No React, Drizzle, or Effect rules unless you add them.
- **`strict-full`** composes `strict-ts` with **`strict-drizzle`**, **`strict-web`** (Next App Router and React), and **`effect-observability`**. Use it when you want the full Rika stack in one extend.
- **`strict-next`** is a thin alias of **`strict-web`**. Compose **`strict`** + **`strict-next`** for Next-only frontends.
- **`strict-effect`** extends **`strict-full`** (same rules as **`strict-full`** in one preset name).
- Opt in individually: add **`strict-drizzle`**, **`strict-web`**, or **`effect-observability`** after **`strict`** when only part of the stack applies.

### Tests: Vitest, Bun, and Jest

- **`strict-tests`** is **Vitest-first**: it enables **`vitest/*`** rules, **jsdoc** checks, and **`@rikalabs/no-placeholder-tests`** / **`@rikalabs/no-mock-only-tests`**. It does **not** load the Jest plugin by default.
- **`bun:test`** (Bun’s built-in runner) uses `import { … } from "bun:test"`. Oxlint’s Vitest rules apply where the linter matches test patterns; behavior can differ from running Vitest’s own CLI—treat mismatches as documentation or config gaps.
- **`strict-tests-jest`** extends **`strict-tests`** and adds **Jest** plugin rules for codebases that still use Jest.

Example (Next frontend only):

```json
{
	"$schema": "./node_modules/oxlint/configuration_schema.json",
	"options": {
		"typeAware": true
	},
	"extends": [
		"./node_modules/@rikalabs/oxlint-standards/presets/strict.json",
		"./node_modules/@rikalabs/oxlint-standards/presets/strict-next.json"
	],
	"jsPlugins": ["@rikalabs/oxlint-standards/plugin"]
}
```

Example (opt into Drizzle + Effect, no Next):

```json
{
	"$schema": "./node_modules/oxlint/configuration_schema.json",
	"options": {
		"typeAware": true
	},
	"extends": [
		"./node_modules/@rikalabs/oxlint-standards/presets/strict.json",
		"./node_modules/@rikalabs/oxlint-standards/presets/strict-drizzle.json",
		"./node_modules/@rikalabs/oxlint-standards/presets/effect-observability.json"
	],
	"jsPlugins": ["@rikalabs/oxlint-standards/plugin"]
}
```

Example (full stack in one preset):

```json
{
	"$schema": "./node_modules/oxlint/configuration_schema.json",
	"options": {
		"typeAware": true
	},
	"extends": ["./node_modules/@rikalabs/oxlint-standards/presets/strict-full.json"],
	"jsPlugins": ["@rikalabs/oxlint-standards/plugin"]
}
```

You can also extend **`strict-drizzle`** or **`strict-web`** alone on top of **`strict`** if you are incrementally adopting rules.

### Less verbose explicit returns

- **`typescript-hard-mode`** enables both **`typescript/explicit-function-return-type`** and **`typescript/explicit-module-boundary-types`**. If boundary types are enough, use **`strict-ts-boundaries`** (same as `strict-ts` but **`typescript/explicit-function-return-type`** is off) or compose from **`typescript-hard-mode-boundaries-only`** when building a custom preset chain.

### Threshold overrides (in `strict-core`)

`strict-core` applies file-scoped **overrides** to reduce noise without dropping rules globally:

| Area | Globs | What changes |
| --- | --- | --- |
| Tests | `**/*.{test,spec}.{ts,tsx,mts,cts}`, `**/__tests__/**/*` | `eslint/no-magic-numbers` off; `max-lines-per-function` max 120; `complexity` max 20 |
| Scripts and config | `**/scripts/**`, `**/*.config.*`, `**/tools/**` | `eslint/no-console` off |
| UI trees | `**/components/**`, `**/app/**` (jsx/tsx) | `max-lines-per-function` max 120; `complexity` max 15 |

## Presets

1. `core-clean`
2. `typescript-hard-mode`
3. `typescript-hard-mode-boundaries-only` (like `typescript-hard-mode` but **`typescript/explicit-function-return-type`** off)
4. `imports-hygiene`
5. `promise-safety`
6. `naming-discipline`
7. `effect-runtime`
8. `effect-error-model`
9. `effect-composition`
10. `effect-observability`
11. `strict-core`
12. `strict-runtime`
13. `strict-drizzle`
14. `strict-web`
15. `strict-next` (alias of `strict-web`)
16. `strict-tests` (Vitest + jsdoc + custom test rules; no Jest plugin)
17. `strict-tests-jest` (extends `strict-tests` with Jest plugin rules)
18. `strict-ts` (same layers as `strict`: `strict-core` + `strict-runtime` + `strict-tests`)
19. `strict-ts-boundaries` (like `strict-ts` but **`typescript/explicit-function-return-type`** off)
20. `strict` (default TypeScript-only baseline; alias chain: `strict-ts`)
21. `strict-full` (`strict-ts` + `strict-drizzle` + `strict-web` + `effect-observability`)
22. `strict-effect` (compatibility alias: extends `strict-full`)

Also available: `recommended` (alias of `strict`), `recommended-ts` (alias of `strict`).

## Custom rules

Default strict custom rules include:

- `@rikalabs/no-vague-verbs`
- `@rikalabs/no-duplicate-context`
- `@rikalabs/no-import-then-reexport`
- `@rikalabs/no-is-record-helpers`
- `@rikalabs/no-trivial-runtime-guard-helpers`
- `@rikalabs/no-trivial-property-helpers`
- `@rikalabs/no-single-use-trivial-helpers`
- `@rikalabs/no-bare-wrapper-functions`
- `@rikalabs/no-pass-through-intermediate-vars`
- `@rikalabs/no-silent-catch-fallback`
- `@rikalabs/no-runtime-compat-fallbacks`
- `@rikalabs/no-catch-return-error-object`
- `@rikalabs/no-unlisted-external-imports`
- `@rikalabs/no-double-type-assertion`
- `@rikalabs/no-property-default-fallbacks`
- `@rikalabs/no-redundant-const-assertion`
- `@rikalabs/no-ai-debt-comments`
- `@rikalabs/no-tutorial-comments`
- `@rikalabs/no-commented-out-code`
- `@rikalabs/no-debug-residue-filenames`
- `@rikalabs/no-json-parse-default-fallback`
- `@rikalabs/no-json-stringify-default-fallback`
- `@rikalabs/no-as-never`
- `@rikalabs/drizzle-enforce-delete-with-where`
- `@rikalabs/drizzle-enforce-update-with-where`
- `@rikalabs/drizzle-no-unbounded-select`
- `@rikalabs/drizzle-no-raw-sql-crud`
- `@rikalabs/drizzle-require-transaction-scope`
- `@rikalabs/drizzle-require-infer-types`
- `@rikalabs/drizzle-require-references-callback`
- `@rikalabs/drizzle-no-driver-query-in-domain`
- `@rikalabs/drizzle-no-query-in-loops`
- `@rikalabs/next-no-browser-api-in-server-component`
- `@rikalabs/next-require-server-directive-in-actions`
- `@rikalabs/next-no-use-client-in-root-files`
- `@rikalabs/next-no-pages-router-api-in-app-dir`
- `@rikalabs/effect-no-raw-promises`
- `@rikalabs/effect-no-try-catch`
- `@rikalabs/effect-no-async-await`
- `@rikalabs/effect-no-looped-effects`
- `@rikalabs/no-placeholder-implementation`
- `@rikalabs/no-low-signal-public-names`
- `@rikalabs/no-low-signal-variable-names`
- `@rikalabs/no-generic-module-names`
- `@rikalabs/no-identical-branches`
- `@rikalabs/no-copy-paste-exports`
- `@rikalabs/no-standalone-classes`
- `@rikalabs/no-hardcoded-secrets`
- `@rikalabs/no-sql-string-concat`
- `@rikalabs/no-anemic-errors`
 
`strict-tests` also adds:

- `@rikalabs/no-placeholder-tests`
- `@rikalabs/no-mock-only-tests`
 
Effect rules included when you extend **`strict-full`** or **`effect-observability`** also include:

- `@rikalabs/effect-no-or-die`
- `@rikalabs/effect-catch-handler-must-use-error`
- `@rikalabs/effect-no-terminal-runners`
- `@rikalabs/effect-no-generic-error-fail`
- `@rikalabs/effect-prefer-gen-over-flatmap-chain`
- `@rikalabs/effect-no-effect-return-in-map`
- `@rikalabs/effect-require-span-name`

## Coverage map

| Complaint family | Coverage |
| --- | --- |
| Defensive helper/type guard slop | `@rikalabs/no-is-record-helpers`, `@rikalabs/no-trivial-runtime-guard-helpers`, `@rikalabs/no-trivial-property-helpers`, `@rikalabs/no-single-use-trivial-helpers` |
| Helper hell / indirection / intermediate vars | `@rikalabs/no-bare-wrapper-functions`, `@rikalabs/no-pass-through-intermediate-vars`, `@rikalabs/no-copy-paste-exports`, `@rikalabs/no-identical-branches` |
| Fail-fast over fallback defaults | `@rikalabs/no-silent-catch-fallback`, `@rikalabs/no-runtime-compat-fallbacks`, `@rikalabs/no-json-parse-default-fallback`, `@rikalabs/no-json-stringify-default-fallback`, `@rikalabs/no-property-default-fallbacks` |
| Comments / debug residue / AI narration | `@rikalabs/no-ai-debt-comments`, `@rikalabs/no-tutorial-comments`, `@rikalabs/no-commented-out-code`, `@rikalabs/no-debug-residue-filenames`, `eslint/no-warning-comments`, `eslint/no-debugger`, `eslint/no-console` |
| TypeScript escape hatches | `typescript/no-explicit-any`, `typescript/no-non-null-assertion`, `typescript/no-unnecessary-type-assertion`, `@rikalabs/no-double-type-assertion`, `@rikalabs/no-as-never`, `@rikalabs/no-redundant-const-assertion`, `typescript/consistent-type-definitions` |
| Naming / readability / structure | `@rikalabs/no-vague-verbs`, `@rikalabs/no-low-signal-public-names`, `@rikalabs/no-low-signal-variable-names`, `@rikalabs/no-generic-module-names`, `@rikalabs/no-standalone-classes`, `eslint/max-params`, `eslint/max-depth`, `eslint/max-lines-per-function`, `eslint/complexity`, `eslint/no-nested-ternary` |
| Tests with placeholders or only mocks | `vitest/*` (default), optional Jest rules via **`strict-tests-jest`**, `@rikalabs/no-placeholder-tests`, `@rikalabs/no-mock-only-tests` |
| Security / secrets / SQL string building | `@rikalabs/no-hardcoded-secrets`, `@rikalabs/no-sql-string-concat` |

Explicit non-goals in the TypeScript-only default (`strict`) v1:

- no project-specific banned API inventories
- no deprecated-API catalog
- no heuristic React error-boundary rule
- no generic “missing validation” rule detached from concrete AST patterns

## Built-in overlap policy

Custom rules must not duplicate Oxlint built-ins.

- Rule catalog: `src/plugin/rule-catalog.json`
- Verification script: `scripts/check-builtin-overlap.ts`

Run:

```bash
bun run check:builtins
```

## Development

```bash
bun install
bun run check
```

Publishing is automated: create a [GitHub release](https://github.com/Rika-Labs/oxlint-standards/releases) from a version tag (for example `v0.4.1`). The [Publish workflow](.github/workflows/publish.yml) runs tests and publishes `@rikalabs/oxlint-standards` to npm when the release is published.

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to change rules and presets. The [minimal consumer example](examples/minimal-consumer/) mirrors npm-style `extends` (config in [`oxlint.smoke.json`](examples/minimal-consumer/oxlint.smoke.json) so it does not conflict with a parent `.oxlintrc.json`) and is exercised in CI.
