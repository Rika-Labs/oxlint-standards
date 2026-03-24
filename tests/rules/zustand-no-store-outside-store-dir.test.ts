import { describe, expect, it } from "bun:test";
import { zustandNoStoreOutsideStoreDirRule } from "../../src/plugin/rules/zustand-no-store-outside-store-dir.ts";
import { callExpressionNode, createTestContext, expressionStatementNode, identifierNode, importDeclarationNode, programNode } from "./helpers.ts";

describe("zustand-no-store-outside-store-dir", () => {
	it("reports create() outside store directories", () => {
		const { context, reports } = createTestContext("src/features/sidebar.ts");
		const visitor = zustandNoStoreOutsideStoreDirRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("zustand"),
				expressionStatementNode(
					callExpressionNode(identifierNode("create")),
				),
			]),
		);
		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("storeOutsideDir");
	});

	it("allows create() in store directories", () => {
		const { context } = createTestContext("src/store/canvas-store.ts");
		const visitor = zustandNoStoreOutsideStoreDirRule.create(context);
		expect(Object.keys(visitor)).toHaveLength(0);
	});

	it("ignores files without zustand imports", () => {
		const { context, reports } = createTestContext("src/features/sidebar.ts");
		const visitor = zustandNoStoreOutsideStoreDirRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("react"),
				expressionStatementNode(
					callExpressionNode(identifierNode("create")),
				),
			]),
		);
		expect(reports).toHaveLength(0);
	});

	it("ignores test files", () => {
		const { context } = createTestContext("src/features/sidebar.test.ts");
		const visitor = zustandNoStoreOutsideStoreDirRule.create(context);
		expect(Object.keys(visitor)).toHaveLength(0);
	});
});
