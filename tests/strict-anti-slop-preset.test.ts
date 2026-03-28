import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type PresetConfig = {
	readonly rules?: Readonly<Record<string, unknown>>;
};

const readPreset = (name: string): PresetConfig =>
	JSON.parse(readFileSync(resolve(import.meta.dir, "..", "presets", `${name}.json`), "utf8")) as PresetConfig;

describe("strict anti-slop preset coverage", () => {
	it("adds the expanded anti-slop built-ins to strict-core", () => {
		const strictCore = readPreset("strict-core");

		expect(strictCore.rules?.["eslint/no-console"]).toBe("error");
		expect(strictCore.rules?.["eslint/prefer-destructuring"]).toBeUndefined();
		expect(strictCore.rules?.["eslint/no-warning-comments"]).toBe("error");
		expect(strictCore.rules?.["eslint/max-params"]).toBe("off");
		expect(strictCore.rules?.["typescript/consistent-type-definitions"]).toEqual(["error", "type"]);
		expect(strictCore.rules?.["unicorn/no-static-only-class"]).toBe("error");
	});

	it("keeps anti-slop focused on the default strict baseline", () => {
		const antiSlop = readPreset("anti-slop");

		expect(antiSlop.rules?.["@rikalabs/no-trivial-runtime-guard-helpers"]).toBe("error");
		expect(antiSlop.rules?.["@rikalabs/no-trivial-property-helpers"]).toBe("error");
		expect(antiSlop.rules?.["@rikalabs/no-single-use-trivial-helpers"]).toBe("error");
		expect(antiSlop.rules?.["@rikalabs/no-pass-through-intermediate-vars"]).toBe("error");
		expect(antiSlop.rules?.["@rikalabs/no-property-default-fallbacks"]).toBe("error");
		expect(antiSlop.rules?.["@rikalabs/no-hardcoded-secrets"]).toBe("error");
	});

	it("ships test-only anti-pattern rules through strict-tests (Vitest-first)", () => {
		const strictTests = readPreset("strict-tests");

		expect(strictTests.rules?.["vitest/no-conditional-tests"]).toBe("error");
		expect(strictTests.rules?.["@rikalabs/no-placeholder-tests"]).toBe("error");
		expect(strictTests.rules?.["@rikalabs/no-mock-only-tests"]).toBe("error");
	});

	it("strict-tests-jest adds Jest rules on top of strict-tests", () => {
		const jestPack = readPreset("strict-tests-jest");

		expect(jestPack.rules?.["jest/expect-expect"]).toBe("error");
		expect(jestPack.rules?.["jest/no-standalone-expect"]).toBe("error");
	});
});
