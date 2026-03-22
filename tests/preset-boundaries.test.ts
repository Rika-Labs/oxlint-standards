import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type PresetConfig = {
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

	it("includes drizzle and effect standards in strict-full", () => {
		const fullGraph = readPresetGraph("strict-full");

		expect(fullGraph.presetNames.has("strict-drizzle")).toBe(true);
		expect(fullGraph.presetNames.has("strict-web")).toBe(true);
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
			"./effect-observability.json",
		]);
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
});
