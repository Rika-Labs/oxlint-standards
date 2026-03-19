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
const hasEffectPreset = (presetName: string): boolean => presetName.startsWith("effect-");
const hasDrizzleRule = (ruleName: string): boolean => ruleName.startsWith("@rikalabs/drizzle-");

describe("preset boundaries", () => {
	it("includes drizzle and effect standards in strict", () => {
		const strictGraph = readPresetGraph("strict");

		expect(strictGraph.presetNames.has("strict-drizzle")).toBe(true);
		expect([...strictGraph.presetNames].some(hasEffectPreset)).toBe(true);
		expect([...strictGraph.ruleNames].some(hasEffectRule)).toBe(true);
		expect([...strictGraph.ruleNames].some(hasDrizzleRule)).toBe(true);
	});

	it("includes drizzle and effect standards in recommended", () => {
		const recommendedGraph = readPresetGraph("recommended");

		expect(recommendedGraph.presetNames.has("strict-drizzle")).toBe(true);
		expect([...recommendedGraph.presetNames].some(hasEffectPreset)).toBe(true);
		expect([...recommendedGraph.ruleNames].some(hasEffectRule)).toBe(true);
		expect([...recommendedGraph.ruleNames].some(hasDrizzleRule)).toBe(true);
	});

	it("keeps strict-effect as a compatibility alias", () => {
		const strictEffectGraph = readPresetGraph("strict-effect");

		expect(strictEffectGraph.presetNames.has("strict")).toBe(true);
		expect([...strictEffectGraph.ruleNames].some(hasEffectRule)).toBe(true);
	});
});
