# Contributing

## Checks

Run the full suite before opening a PR:

```bash
bun install
bun run check
```

`check` runs lint, TypeScript, tests, and the built-in overlap script.

## Adding or changing a custom rule

1. Implement the rule under [`src/plugin/rules/`](src/plugin/rules/).
2. Register it in [`src/plugin/index.ts`](src/plugin/index.ts).
3. Add tests under [`tests/rules/`](tests/rules/).
4. Add an entry to [`src/plugin/rule-catalog.json`](src/plugin/rule-catalog.json) explaining why a built-in rule is insufficient.
5. Run `bun run check:builtins` and fix any overlap with Oxlint built-ins.

Custom rules must not duplicate Oxlint built-ins. See **Built-in overlap policy** in [README.md](README.md).

## Presets

Preset JSON lives in [`presets/`](presets/). If you add or rename a preset, update [README.md](README.md) and any tests in [`tests/preset-boundaries.test.ts`](tests/preset-boundaries.test.ts). Add the name to [`src/index.ts`](src/index.ts) `presetNames` when it should be part of the public list.

## Smoke example

[`examples/minimal-consumer/`](examples/minimal-consumer/) mirrors how a consuming repo depends on this package. CI runs `oxlint` there to catch publish path or config regressions. The example uses [`oxlint.smoke.json`](examples/minimal-consumer/oxlint.smoke.json) (not `.oxlintrc.json`) so the workspace root `oxlint .` does not try to merge a nested config with `options.typeAware`. Run `bun run lint` inside `examples/minimal-consumer`.
