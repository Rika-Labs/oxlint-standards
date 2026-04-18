import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type PresetConfig = {
	readonly categories?: Readonly<Record<string, string>>;
	readonly extends?: ReadonlyArray<string>;
	readonly rules?: Readonly<Record<string, unknown>>;
};

type PresetGraph = {
	readonly presetNames: ReadonlySet<string>;
	readonly ruleNames: ReadonlySet<string>;
};

const PRESETS_DIR = resolve(import.meta.dir, "..", "presets");

const toPresetName = (extendPath: string): string =>
	extendPath.replace(/^\.\//, "").replace(/\.json$/, "");

const readPreset = (presetName: string): PresetConfig => {
	const filePath = resolve(PRESETS_DIR, `${presetName}.json`);
	return JSON.parse(readFileSync(filePath, "utf8")) as PresetConfig;
};

const readPresetGraph = (entryPresetName: string): PresetGraph => {
	const pending = [entryPresetName];
	const presetNames = new Set<string>();
	const ruleNames = new Set<string>();

	while (pending.length > 0) {
		const current = pending.pop();
		if (current === undefined || presetNames.has(current)) {
			continue;
		}

		presetNames.add(current);
		const preset = readPreset(current);

		for (const ruleName of Object.keys(preset.rules ?? {})) {
			ruleNames.add(ruleName);
		}

		for (const extendPath of preset.extends ?? []) {
			pending.push(toPresetName(extendPath));
		}
	}

	return { presetNames, ruleNames };
};

const hasEffectRule = (ruleName: string): boolean => ruleName.startsWith("@rikalabs/effect-");
const hasDrizzleRule = (ruleName: string): boolean => ruleName.startsWith("@rikalabs/drizzle-");

describe("preset boundaries", () => {
	it("strict and recommended are TypeScript-only without stack packs", () => {
		const strictGraph = readPresetGraph("strict");

		expect(strictGraph.presetNames.has("strict-drizzle")).toBe(false);
		expect(strictGraph.presetNames.has("strict-web")).toBe(false);
		expect(strictGraph.presetNames.has("effect-observability")).toBe(false);
		expect([...strictGraph.ruleNames].some(hasEffectRule)).toBe(false);
		expect([...strictGraph.ruleNames].some(hasDrizzleRule)).toBe(false);

		const recommendedGraph = readPresetGraph("recommended");

		expect(recommendedGraph.presetNames.has("strict-drizzle")).toBe(false);
		expect(recommendedGraph.presetNames.has("strict-web")).toBe(false);
	});

	it("core-clean enables every builtin category at error", () => {
		const coreClean = readPreset("core-clean");

		expect(coreClean.categories).toEqual({
			correctness: "error",
			suspicious: "error",
			pedantic: "error",
			perf: "error",
			style: "error",
			restriction: "error",
			nursery: "error",
		});
	});

	it("keeps effect-observability limited to observability concerns", () => {
		const observabilityGraph = readPresetGraph("effect-observability");

		expect(observabilityGraph.presetNames.has("effect-service-hygiene")).toBe(false);
		expect(observabilityGraph.presetNames.has("effect-composition")).toBe(false);
		expect(observabilityGraph.presetNames.has("effect-error-model")).toBe(false);
		expect(observabilityGraph.presetNames.has("effect-runtime")).toBe(false);
		expect(observabilityGraph.ruleNames).toEqual(new Set(["@rikalabs/effect-require-span-name"]));
	});

	it("includes drizzle and effect standards in strict-full", () => {
		const fullGraph = readPresetGraph("strict-full");

		expect(fullGraph.presetNames.has("strict-drizzle")).toBe(true);
		expect(fullGraph.presetNames.has("strict-web")).toBe(true);
		expect(fullGraph.presetNames.has("effect-service-hygiene")).toBe(true);
		expect(fullGraph.presetNames.has("effect-observability")).toBe(true);
		expect([...fullGraph.ruleNames].some(hasEffectRule)).toBe(true);
		expect([...fullGraph.ruleNames].some(hasDrizzleRule)).toBe(true);
	});

	it("keeps strict-effect as a compatibility alias of strict-full", () => {
		const strictEffectGraph = readPresetGraph("strict-effect");

		expect(strictEffectGraph.presetNames.has("strict-full")).toBe(true);
		expect([...strictEffectGraph.ruleNames].some(hasEffectRule)).toBe(true);
	});

	it("strict-ts is portable TS without drizzle, web, or effect packs", () => {
		const tsGraph = readPresetGraph("strict-ts");

		expect(tsGraph.presetNames.has("strict-core")).toBe(true);
		expect(tsGraph.presetNames.has("strict-runtime")).toBe(true);
		expect(tsGraph.presetNames.has("strict-tests")).toBe(true);
		expect(tsGraph.presetNames.has("strict-drizzle")).toBe(false);
		expect(tsGraph.presetNames.has("strict-web")).toBe(false);
		expect(tsGraph.presetNames.has("effect-observability")).toBe(false);
	});

	it("strict is an alias chain to strict-ts", () => {
		const strictPreset = readPreset("strict");

		expect(strictPreset.extends).toEqual(["./strict-ts.json"]);
	});

	it("strict-full composes strict-ts with stack-specific extends", () => {
		const full = readPreset("strict-full");

		expect(full.extends).toEqual([
			"./strict-ts.json",
			"./strict-drizzle.json",
			"./strict-web.json",
			"./strict-zustand.json",
			"./strict-electrobun.json",
			"./strict-bun.json",
			"./effect-service-hygiene.json",
			"./effect-observability.json",
		]);
		expect(full.rules?.["typescript/explicit-function-return-type"]).toBe("off");
		expect(full.rules?.["typescript/explicit-module-boundary-types"]).toBe("off");
		expect(full.rules?.["eslint/no-void"]).toBe("off");
		expect(full.rules?.["unicorn/no-useless-undefined"]).toBe("off");
	});

	it("anti-slop-aggressive extends anti-slop with the trimmed heuristics", () => {
		const aggressive = readPreset("anti-slop-aggressive");

		expect(aggressive.extends).toEqual(["./anti-slop.json"]);
		expect(aggressive.rules?.["@rikalabs/no-single-use-trivial-helpers"]).toBe("error");
		expect(aggressive.rules?.["@rikalabs/no-pass-through-intermediate-vars"]).toBe("error");
		expect(aggressive.rules?.["@rikalabs/no-property-default-fallbacks"]).toBe("error");
	});

	it("strict-core carries the default style and threshold relaxations", () => {
		const strictCore = readPreset("strict-core");

		expect(strictCore.rules?.["eslint/no-ternary"]).toBe("off");
		expect(strictCore.rules?.["eslint/prefer-object-spread"]).toBe("off");
		expect(strictCore.rules?.["eslint/max-lines-per-function"]).toEqual([
			"error",
			{ max: 60, skipBlankLines: true, skipComments: true },
		]);
		expect(strictCore.rules?.["eslint/max-classes-per-file"]).toEqual(["error", 1]);
		expect(strictCore.rules?.["eslint/max-lines"]).toEqual([
			"error",
			{ max: 1500, skipBlankLines: true, skipComments: true },
		]);
		expect(strictCore.rules?.["oxc/no-optional-chaining"]).toBe("off");
		expect(strictCore.rules?.["oxc/no-rest-spread-properties"]).toBe("off");
		expect(strictCore.rules?.["oxc/no-map-spread"]).toBe("off");
	});

	it("strict-ts applies the default TypeScript and runtime relaxations on top of strict-core", () => {
		const strictTs = readPreset("strict-ts");

		expect(strictTs.rules?.["typescript/explicit-function-return-type"]).toBe("off");
		expect(strictTs.rules?.["typescript/explicit-module-boundary-types"]).toBe("off");
		expect(strictTs.rules?.["eslint/no-void"]).toBe("off");
		expect(strictTs.rules?.["unicorn/no-useless-undefined"]).toBe("off");
	});

	it("strict-tests keeps jsdoc focused on useful metadata, not boilerplate tags", () => {
		const t = readPreset("strict-tests");

		expect(t.rules?.["jsdoc/no-defaults"]).toBe("off");
		expect(t.rules?.["jsdoc/require-param"]).toBe("off");
		expect(t.rules?.["jsdoc/require-param-type"]).toBe("off");
		expect(t.rules?.["jsdoc/require-returns"]).toBe("off");
		expect(t.rules?.["jsdoc/require-returns-type"]).toBe("off");
	});

	it("strict-web relaxes multi-component and prop-construction noise", () => {
		const web = readPreset("strict-web");

		expect(web.rules?.["react/no-multi-comp"]).toBe("off");
		expect(web.rules?.["react/jsx-max-depth"]).toBe("off");
		expect(web.rules?.["react/jsx-props-no-spreading"]).toBe("off");
		expect(web.rules?.["react-perf/jsx-no-new-function-as-prop"]).toBe("off");
		expect(web.rules?.["react-perf/jsx-no-new-object-as-prop"]).toBe("off");
	});

	it("effect-runtime leaves raw promises to the consumer boundary policy", () => {
		const effectRuntime = readPreset("effect-runtime");

		expect(effectRuntime.rules?.["@rikalabs/effect-no-raw-promises"]).toBe("off");
	});

	it("strict-ts-boundaries turns off explicit-function-return-type", () => {
		const boundaries = readPreset("strict-ts-boundaries");

		expect(boundaries.extends).toEqual(["./strict-ts.json"]);
		expect(boundaries.rules?.["typescript/explicit-function-return-type"]).toBe("off");
	});

	it("recommended-ts aliases strict", () => {
		const rec = readPreset("recommended-ts");

		expect(rec.extends).toEqual(["./strict.json"]);
	});

	it("typescript-hard-mode-boundaries-only disables explicit-function-return-type", () => {
		const b = readPreset("typescript-hard-mode-boundaries-only");

		expect(b.extends).toEqual(["./typescript-hard-mode.json"]);
		expect(b.rules?.["typescript/explicit-function-return-type"]).toBe("off");
	});

	it("strict-next extends strict-web", () => {
		const next = readPreset("strict-next");

		expect(next.extends).toEqual(["./strict-web.json"]);
	});

	it("strict-tests is Vitest-first without Jest rules", () => {
		const t = readPreset("strict-tests");

		expect(t.rules?.["jest/expect-expect"]).toBeUndefined();
		expect(t.rules?.["vitest/no-conditional-tests"]).toBe("error");
	});

	it("strict-tests-jest extends strict-tests with Jest rules", () => {
		const j = readPreset("strict-tests-jest");

		expect(j.extends).toEqual(["./strict-tests.json"]);
		expect(j.rules?.["jest/valid-expect"]).toBe("error");
	});
});
