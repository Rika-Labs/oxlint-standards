import { describe, expect, it } from "bun:test";
import { effectNoLayerInLeafModulesRule } from "../../src/plugin/rules/effect-no-layer-in-leaf-modules.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("effect-no-layer-in-leaf-modules", () => {
	it("reports Layer.succeed in leaf module", () => {
		const { context, reports } = createTestContext("src/feature/service.ts");
		const visitor = effectNoLayerInLeafModulesRule.create(context);

		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "Layer" }),
					property: asNode({ type: "Identifier", name: "succeed" }),
				}),
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("forbidden");
	});

	it("does not report Layer.succeed in composition root file", () => {
		const { context } = createTestContext("src/layers.ts");
		const visitor = effectNoLayerInLeafModulesRule.create(context);

		// visitor should be empty object for composition root files
		expect(Object.keys(visitor)).toHaveLength(0);
	});

	it("does not report Layer.succeed in test file", () => {
		const { context } = createTestContext("src/example.test.ts");
		const visitor = effectNoLayerInLeafModulesRule.create(context);

		// visitor should be empty object for test files
		expect(Object.keys(visitor)).toHaveLength(0);
	});
});
