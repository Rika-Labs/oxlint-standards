import { describe, expect, it } from "bun:test";
import plugin, { customRules } from "../src/plugin/index.ts";

describe("plugin registration", () => {
	it("registers all custom rules under @rikalabs", () => {
		expect(plugin.meta.name).toBe("@rikalabs");
		expect(Object.keys(customRules)).toHaveLength(61);
		expect(Object.keys(customRules)).toContain("effect-no-or-die");
		expect(Object.keys(customRules)).toContain("effect-catch-handler-must-use-error");
		expect(Object.keys(customRules)).toContain("no-vague-verbs");
		expect(Object.keys(customRules)).toContain("no-is-record-helpers");
		expect(Object.keys(customRules)).toContain("no-silent-catch-fallback");
		expect(Object.keys(customRules)).toContain("no-catch-return-error-object");
		expect(Object.keys(customRules)).toContain("no-unlisted-external-imports");
		expect(Object.keys(customRules)).toContain("no-json-stringify-default-fallback");
		expect(Object.keys(customRules)).toContain("no-trivial-runtime-guard-helpers");
		expect(Object.keys(customRules)).toContain("no-placeholder-tests");
	});
});
