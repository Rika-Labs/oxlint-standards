# @rikalabs/oxlint-standards

Strict, opinionated Oxlint defaults for TypeScript + Effect projects.

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
14. `strict`

Also available: `recommended` (currently an alias of `strict`).

## Custom rules

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

# oxlint-standards
