# @rikalabs/oxlint-standards

Strict, opinionated Oxlint defaults for TypeScript projects, with first-class Drizzle, Next App Router, and Effect guardrails.

This package ships two things:

- shared Oxlint presets (`presets/*.json`)
- a custom JS plugin (`@rikalabs/*`) for rules Oxlint does not provide natively

## Goals

- enforce consistent standards across repositories
- prefer Oxlint built-ins first, custom rules second
- keep custom rules architecture-agnostic for open source reuse

## Install

```bash
bun add -d @rikalabs/oxlint-standards oxlint
```

## Use in `.oxlintrc.json`

```json
{
	"$schema": "./node_modules/oxlint/configuration_schema.json",
	"extends": ["./node_modules/@rikalabs/oxlint-standards/presets/strict.json"],
	"jsPlugins": ["@rikalabs/oxlint-standards/plugin"]
}
```

`jsPlugins` must be declared by the consuming project because Oxlint currently only merges `rules`, `plugins`, and `overrides` through `extends`.

## Preset strategy

- `strict` is the default full-stack baseline for TypeScript + custom agent-focused standards.
- `strict` now includes Drizzle, Next App Router, and Effect guardrails.
- Framework/domain packs remain modular internally, but the default preset graph is intentionally broader.

Example (opt into Effect rules):

```json
{
	"$schema": "./node_modules/oxlint/configuration_schema.json",
	"extends": ["./node_modules/@rikalabs/oxlint-standards/presets/strict-effect.json"],
	"jsPlugins": ["@rikalabs/oxlint-standards/plugin"]
}
```

If you only want the Drizzle pack without the full baseline, extend `strict-drizzle` directly.

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
12. `strict-drizzle`
13. `strict-web`
14. `strict-tests`
15. `strict-effect` (compatibility alias)
16. `strict`

Also available: `recommended` (currently an alias of `strict`).

## Custom rules

Default strict custom rules:

- `@rikalabs/no-vague-verbs`
- `@rikalabs/no-duplicate-context`
- `@rikalabs/no-import-then-reexport`
- `@rikalabs/no-is-record-helpers`
- `@rikalabs/no-silent-catch-fallback`
- `@rikalabs/no-runtime-compat-fallbacks`
- `@rikalabs/no-catch-return-error-object`
- `@rikalabs/no-unlisted-external-imports`
- `@rikalabs/no-double-type-assertion`
- `@rikalabs/no-ai-debt-comments`
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

Effect rules included in `strict`:

- `@rikalabs/effect-no-or-die`
- `@rikalabs/effect-catch-handler-must-use-error`
- `@rikalabs/effect-no-terminal-runners`
- `@rikalabs/effect-no-generic-error-fail`
- `@rikalabs/effect-prefer-gen-over-flatmap-chain`
- `@rikalabs/effect-no-effect-return-in-map`
- `@rikalabs/effect-require-span-name`

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
