# @rikalabs/oxlint-standards

Strict, opinionated Oxlint defaults for TypeScript projects, with a full anti-slop baseline and opt-in packs for framework-specific standards.

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

- `strict` is the default baseline for TypeScript + the full anti-slop ruleset.
- `strict` intentionally excludes framework-specific packs.
- Framework/domain packs are opt-in via extra presets layered in `extends`.

Example (opt into Effect rules):

```json
{
	"$schema": "./node_modules/oxlint/configuration_schema.json",
	"options": {
		"typeAware": true
	},
	"extends": ["./node_modules/@rikalabs/oxlint-standards/presets/strict-effect.json"],
	"jsPlugins": ["@rikalabs/oxlint-standards/plugin"]
}
```

## Presets

1. `core-clean`
2. `typescript-hard-mode`
3. `imports-hygiene`
4. `promise-safety`
5. `naming-discipline`
6. `effect-runtime`
7. `effect-error-model`
8. `effect-composition`
9. `effect-observability`
10. `strict-core`
11. `strict-runtime`
12. `strict-web`
13. `strict-tests`
14. `strict-effect` (opt-in pack)
15. `strict`

Also available: `recommended` (an alias of `strict`).

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

Opt-in Effect rules include:

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
| Tests with placeholders or only mocks | `jest/expect-expect`, `jest/no-standalone-expect`, `@rikalabs/no-placeholder-tests`, `@rikalabs/no-mock-only-tests` |
| Security / secrets / SQL string building | `@rikalabs/no-hardcoded-secrets`, `@rikalabs/no-sql-string-concat` |

Explicit non-goals in `strict` v1:

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
