import { describe, expect, it } from "bun:test";
import { noGenericModuleNamesRule } from "../../src/plugin/rules/no-generic-module-names.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-generic-module-names", () => {
	it("reports generic filename utils.ts", () => {
		const { context, reports } = createTestContext("src/utils.ts");
		const visitor = noGenericModuleNamesRule.create(context);

		visitor.Program?.(asNode({ type: "Program" }));

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("genericName");
	});

	it("does not report domain-specific filename", () => {
		const { context, reports } = createTestContext("src/user-service.ts");
		const visitor = noGenericModuleNamesRule.create(context);

		visitor.Program?.(asNode({ type: "Program" }));

		expect(reports).toHaveLength(0);
	});

	it("reports generic filename helpers.ts", () => {
		const { context, reports } = createTestContext("src/helpers.ts");
		const visitor = noGenericModuleNamesRule.create(context);

		visitor.Program?.(asNode({ type: "Program" }));

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("genericName");
	});

	it("does not report test files even with generic names", () => {
		const { context } = createTestContext("src/example.test.ts");
		const visitor = noGenericModuleNamesRule.create(context);

		// visitor should be empty object for test files, so Program won't exist
		expect(Object.keys(visitor)).toHaveLength(0);
	});
});
