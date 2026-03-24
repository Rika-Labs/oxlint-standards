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

## Smoke examples

[`examples/minimal-consumer/`](examples/minimal-consumer/) mirrors how a consuming repo depends on this package.

The shadow smoke repos under [`examples/`](examples/) cover preset composition directly:

- `smoke-strict-full`
- `smoke-strict-web`
- `smoke-strict-drizzle`
- `smoke-effect`
- `smoke-strict-tests`

Each example uses [`oxlint.smoke.json`](examples/minimal-consumer/oxlint.smoke.json) instead of `.oxlintrc.json` so the workspace root `oxlint .` does not try to merge nested configs with `options.typeAware`.

Verification flow:

```bash
cd examples/<example-name>
bun install --frozen-lockfile
bun run lint
```

Every non-minimal smoke repo also supports:

```bash
bun run lint:fixtures
```

That command copies the bad samples out of `fixtures/` before linting so custom rules that ignore fixture/doc paths still get exercised in CI.
