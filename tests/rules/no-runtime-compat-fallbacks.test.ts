import { describe, expect, it } from "bun:test";
import { noRuntimeCompatFallbacksRule } from "../../src/plugin/rules/no-runtime-compat-fallbacks.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-runtime-compat-fallbacks", () => {
	it("reports compatibility import", () => {
		const { context, reports } = createTestContext();
		const visitor = noRuntimeCompatFallbacksRule.create(context);

		visitor.ImportDeclaration?.(
			asNode({
				type: "ImportDeclaration",
				source: asNode({ type: "Literal", value: "core-js/stable" }),
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("import");
	});

	it("reports compatibility helper names", () => {
		const { context, reports } = createTestContext();
		const visitor = noRuntimeCompatFallbacksRule.create(context);

		visitor.FunctionDeclaration?.(
			asNode({
				type: "FunctionDeclaration",
				id: asNode({ type: "Identifier", name: "applyPolyfill" }),
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("name");
	});
});
