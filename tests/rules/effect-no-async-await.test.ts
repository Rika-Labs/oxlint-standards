import { describe, expect, it } from "bun:test";
import { effectNoAsyncAwaitRule } from "../../src/plugin/rules/effect-no-async-await.ts";
import {
	asNode,
	createTestContext,
	expressionStatementNode,
	identifierNode,
	importDeclarationNode,
	methodCallNode,
	programNode,
} from "./helpers.ts";

const awaitNode = () =>
	asNode({
		type: "AwaitExpression",
		argument: identifierNode("work"),
	});

describe("effect-no-async-await", () => {
	it("reports async functions in Effect modules", () => {
		const { context, reports } = createTestContext("src/domain/user-service.ts");
		const visitor = effectNoAsyncAwaitRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("effect"),
				asNode({
					type: "FunctionDeclaration",
					id: identifierNode("saveUser"),
					params: [],
					async: true,
					body: asNode({
						type: "BlockStatement",
						body: [expressionStatementNode(awaitNode())],
					}),
				}),
			]),
		);
		expect(reports.length).toBeGreaterThanOrEqual(1);
	});

	it("allows async callbacks inside Effect.tryPromise", () => {
		const { context, reports } = createTestContext("src/domain/user-service.ts");
		const visitor = effectNoAsyncAwaitRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("effect"),
				expressionStatementNode(
					methodCallNode(identifierNode("Effect"), "tryPromise", [
						asNode({
							type: "ArrowFunctionExpression",
							params: [],
							async: true,
							body: awaitNode(),
						}),
					]),
				),
			]),
		);
		expect(reports).toHaveLength(0);
	});
});
