import { describe, expect, it } from "bun:test";
import { zustandNoDirectSetInComponentsRule } from "../../src/plugin/rules/zustand-no-direct-set-in-components.ts";
import { createTestContext, expressionStatementNode, identifierNode, importDeclarationNode, methodCallNode, programNode } from "./helpers.ts";

describe("zustand-no-direct-set-in-components", () => {
	it("reports setState on store objects in components", () => {
		const { context, reports } = createTestContext("src/components/Sidebar.tsx");
		const visitor = zustandNoDirectSetInComponentsRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("zustand"),
				expressionStatementNode(
					methodCallNode(identifierNode("canvasStore"), "setState"),
				),
			]),
		);
		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("directSet");
	});

	it("allows setState in store directories", () => {
		const { context } = createTestContext("src/store/canvas-store.ts");
		const visitor = zustandNoDirectSetInComponentsRule.create(context);
		expect(Object.keys(visitor)).toHaveLength(0);
	});

	it("ignores non-store objects", () => {
		const { context, reports } = createTestContext("src/components/Sidebar.tsx");
		const visitor = zustandNoDirectSetInComponentsRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("zustand"),
				expressionStatementNode(
					methodCallNode(identifierNode("someObject"), "setState"),
				),
			]),
		);
		expect(reports).toHaveLength(0);
	});

	it("ignores test files", () => {
		const { context } = createTestContext("src/components/Sidebar.test.tsx");
		const visitor = zustandNoDirectSetInComponentsRule.create(context);
		expect(Object.keys(visitor)).toHaveLength(0);
	});
});
