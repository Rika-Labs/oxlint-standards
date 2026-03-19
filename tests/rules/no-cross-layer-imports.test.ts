import { describe, expect, it } from "bun:test";
import { noCrossLayerImportsRule } from "../../src/plugin/rules/no-cross-layer-imports.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-cross-layer-imports", () => {
	it("reports domain importing from ui layer", () => {
		const { context, reports } = createTestContext("src/domain/user.ts");
		const visitor = noCrossLayerImportsRule.create(context);

		visitor.ImportDeclaration?.(
			asNode({
				type: "ImportDeclaration",
				source: asNode({ type: "Literal", value: "../../ui/Button" }),
				specifiers: [],
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("crossLayer");
	});

	it("allows ui importing from domain layer (correct direction)", () => {
		const { context, reports } = createTestContext("src/ui/page.ts");
		const visitor = noCrossLayerImportsRule.create(context);

		visitor.ImportDeclaration?.(
			asNode({
				type: "ImportDeclaration",
				source: asNode({ type: "Literal", value: "../../domain/user" }),
				specifiers: [],
			}),
		);

		expect(reports).toHaveLength(0);
	});

	it("reports domain importing from ui via alias", () => {
		const { context, reports } = createTestContext("src/domain/user.ts");
		const visitor = noCrossLayerImportsRule.create(context);

		visitor.ImportDeclaration?.(
			asNode({
				type: "ImportDeclaration",
				source: asNode({ type: "Literal", value: "@/ui/Button" }),
				specifiers: [],
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("crossLayer");
	});

	it("does not report for test files", () => {
		const { context } = createTestContext("src/domain/user.test.ts");
		const visitor = noCrossLayerImportsRule.create(context);

		// Visitor should be empty for test files
		expect(visitor.ImportDeclaration).toBeUndefined();
	});
});
