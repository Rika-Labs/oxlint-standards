import { describe, expect, it } from "bun:test";
import { effectNoRawPromisesRule } from "../../src/plugin/rules/effect-no-raw-promises.ts";
import {
	asNode,
	createTestContext,
	expressionStatementNode,
	identifierNode,
	importDeclarationNode,
	methodCallNode,
	programNode,
} from "./helpers.ts";

describe("effect-no-raw-promises", () => {
	it("reports raw Promise construction", () => {
		const { context, reports } = createTestContext("src/domain/user-service.ts");
		const visitor = effectNoRawPromisesRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("effect"),
				expressionStatementNode(
					asNode({
						type: "NewExpression",
						callee: identifierNode("Promise"),
						arguments: [],
					}),
				),
			]),
		);
		expect(reports).toHaveLength(1);
	});

	it("allows Effect.tryPromise usage", () => {
		const { context, reports } = createTestContext("src/domain/user-service.ts");
		const visitor = effectNoRawPromisesRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("effect"),
				expressionStatementNode(methodCallNode(identifierNode("Effect"), "tryPromise")),
			]),
		);
		expect(reports).toHaveLength(0);
	});
});
