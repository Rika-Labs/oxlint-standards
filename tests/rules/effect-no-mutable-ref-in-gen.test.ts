import { describe, expect, it } from "bun:test";
import { effectNoMutableRefInGenRule } from "../../src/plugin/rules/effect-no-mutable-ref-in-gen.ts";
import { asNode, createTestContext, expressionStatementNode, identifierNode, importDeclarationNode, methodCallNode, programNode } from "./helpers.ts";

describe("effect-no-mutable-ref-in-gen", () => {
	it("reports let declarations inside Effect.gen", () => {
		const { context, reports } = createTestContext("src/domain/user-service.ts");
		const visitor = effectNoMutableRefInGenRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("effect"),
				expressionStatementNode(
					methodCallNode(identifierNode("Effect"), "gen", [
						asNode({
							type: "ArrowFunctionExpression",
							params: [],
							body: asNode({
								type: "BlockStatement",
								body: [
									asNode({
										type: "VariableDeclaration",
										kind: "let",
										declarations: [
											asNode({
												type: "VariableDeclarator",
												id: asNode({ type: "Identifier", name: "count" }),
												init: asNode({ type: "Literal", value: 0 }),
											}),
										],
									}),
								],
							}),
						}),
					]),
				),
			]),
		);
		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("mutableInGen");
	});

	it("allows const declarations inside Effect.gen", () => {
		const { context, reports } = createTestContext("src/domain/user-service.ts");
		const visitor = effectNoMutableRefInGenRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("effect"),
				expressionStatementNode(
					methodCallNode(identifierNode("Effect"), "gen", [
						asNode({
							type: "ArrowFunctionExpression",
							params: [],
							body: asNode({
								type: "BlockStatement",
								body: [
									asNode({
										type: "VariableDeclaration",
										kind: "const",
										declarations: [
											asNode({
												type: "VariableDeclarator",
												id: asNode({ type: "Identifier", name: "user" }),
											}),
										],
									}),
								],
							}),
						}),
					]),
				),
			]),
		);
		expect(reports).toHaveLength(0);
	});

	it("ignores non-effect files", () => {
		const { context, reports } = createTestContext("src/utils.ts");
		const visitor = effectNoMutableRefInGenRule.create(context);
		visitor.Program?.(
			programNode([
				expressionStatementNode(
					methodCallNode(identifierNode("Effect"), "gen", [
						asNode({
							type: "ArrowFunctionExpression",
							params: [],
							body: asNode({
								type: "BlockStatement",
								body: [
									asNode({
										type: "VariableDeclaration",
										kind: "let",
										declarations: [],
									}),
								],
							}),
						}),
					]),
				),
			]),
		);
		expect(reports).toHaveLength(0);
	});
});
