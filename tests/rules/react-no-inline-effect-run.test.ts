import { describe, expect, it } from "bun:test";
import { reactNoInlineEffectRunRule } from "../../src/plugin/rules/react-no-inline-effect-run.ts";
import { asNode, createTestContext, expressionStatementNode, identifierNode, importDeclarationNode, methodCallNode, programNode } from "./helpers.ts";

describe("react-no-inline-effect-run", () => {
	it("reports runPromise inside a React component", () => {
		const { context, reports } = createTestContext("src/components/UserList.tsx");
		const visitor = reactNoInlineEffectRunRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("effect"),
				asNode({
					type: "FunctionDeclaration",
					id: asNode({ type: "Identifier", name: "UserList" }),
					params: [],
					body: asNode({
						type: "BlockStatement",
						body: [
							expressionStatementNode(
								methodCallNode(identifierNode("runtime"), "runPromise"),
							),
						],
					}),
				}),
			]),
		);
		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("inlineRun");
	});

	it("ignores lowercase function names (not components)", () => {
		const { context, reports } = createTestContext("src/components/helpers.tsx");
		const visitor = reactNoInlineEffectRunRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("effect"),
				asNode({
					type: "FunctionDeclaration",
					id: asNode({ type: "Identifier", name: "fetchUser" }),
					params: [],
					body: asNode({
						type: "BlockStatement",
						body: [
							expressionStatementNode(
								methodCallNode(identifierNode("runtime"), "runPromise"),
							),
						],
					}),
				}),
			]),
		);
		expect(reports).toHaveLength(0);
	});

	it("ignores non-tsx files", () => {
		const { context } = createTestContext("src/services/user-service.ts");
		const visitor = reactNoInlineEffectRunRule.create(context);
		expect(Object.keys(visitor)).toHaveLength(0);
	});

	it("ignores files without effect imports", () => {
		const { context, reports } = createTestContext("src/components/Simple.tsx");
		const visitor = reactNoInlineEffectRunRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("react"),
				asNode({
					type: "FunctionDeclaration",
					id: asNode({ type: "Identifier", name: "Simple" }),
					params: [],
					body: asNode({
						type: "BlockStatement",
						body: [
							expressionStatementNode(
								methodCallNode(identifierNode("runtime"), "runPromise"),
							),
						],
					}),
				}),
			]),
		);
		expect(reports).toHaveLength(0);
	});
});
