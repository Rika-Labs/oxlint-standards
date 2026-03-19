import { describe, expect, it } from "bun:test";
import { effectNoTryCatchRule } from "../../src/plugin/rules/effect-no-try-catch.ts";
import {
	asNode,
	createTestContext,
	expressionStatementNode,
	identifierNode,
	importDeclarationNode,
	methodCallNode,
	programNode,
} from "./helpers.ts";

const tryStatementNode = () =>
	asNode({
		type: "TryStatement",
		block: asNode({ type: "BlockStatement", body: [] }),
		handler: null,
		finalizer: null,
	});

describe("effect-no-try-catch", () => {
	it("reports raw try/catch usage", () => {
		const { context, reports } = createTestContext("src/domain/user-service.ts");
		const visitor = effectNoTryCatchRule.create(context);
		visitor.Program?.(
			programNode([importDeclarationNode("effect"), tryStatementNode()]),
		);
		expect(reports).toHaveLength(1);
	});

	it("allows try/catch inside Effect.try", () => {
		const { context, reports } = createTestContext("src/domain/user-service.ts");
		const visitor = effectNoTryCatchRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("effect"),
				expressionStatementNode(
					methodCallNode(identifierNode("Effect"), "try", [
						asNode({
							type: "ArrowFunctionExpression",
							params: [],
							async: false,
							body: asNode({
								type: "BlockStatement",
								body: [tryStatementNode()],
							}),
						}),
					]),
				),
			]),
		);
		expect(reports).toHaveLength(0);
	});
});
