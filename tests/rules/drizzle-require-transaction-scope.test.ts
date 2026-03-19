import { describe, expect, it } from "bun:test";
import { drizzleRequireTransactionScopeRule } from "../../src/plugin/rules/drizzle-require-transaction-scope.ts";
import {
	asNode,
	createTestContext,
	expressionStatementNode,
	identifierNode,
	importDeclarationNode,
	methodCallNode,
	programNode,
} from "./helpers.ts";

const functionWithBody = (...body: ReadonlyArray<ReturnType<typeof expressionStatementNode>>) =>
	asNode({
		type: "FunctionDeclaration",
		id: identifierNode("saveUser"),
		params: [],
		async: false,
		body: asNode({
			type: "BlockStatement",
			body: [...body],
		}),
	});

describe("drizzle-require-transaction-scope", () => {
	it("reports functions with multiple writes outside a transaction", () => {
		const { context, reports } = createTestContext("src/domain/user-service.ts");
		const visitor = drizzleRequireTransactionScopeRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("drizzle-orm"),
				functionWithBody(
					expressionStatementNode(methodCallNode(identifierNode("db"), "insert", [identifierNode("users")])),
					expressionStatementNode(methodCallNode(identifierNode("db"), "update", [identifierNode("users")])),
				),
			]),
		);
		expect(reports).toHaveLength(1);
	});

	it("allows functions that use a transaction boundary", () => {
		const { context, reports } = createTestContext("src/domain/user-service.ts");
		const visitor = drizzleRequireTransactionScopeRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("drizzle-orm"),
				functionWithBody(
					expressionStatementNode(
						methodCallNode(identifierNode("db"), "transaction", [
							asNode({
								type: "ArrowFunctionExpression",
								params: [],
								async: false,
								body: asNode({
									type: "BlockStatement",
									body: [
										expressionStatementNode(
											methodCallNode(identifierNode("db"), "insert", [identifierNode("users")]),
										),
										expressionStatementNode(
											methodCallNode(identifierNode("db"), "update", [identifierNode("users")]),
										),
									],
								}),
							}),
						]),
					),
				),
			]),
		);
		expect(reports).toHaveLength(0);
	});

	it("still reports writes outside a nested transaction helper", () => {
		const { context, reports } = createTestContext("src/domain/user-service.ts");
		const visitor = drizzleRequireTransactionScopeRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("drizzle-orm"),
				functionWithBody(
					expressionStatementNode(methodCallNode(identifierNode("db"), "insert", [identifierNode("users")])),
					expressionStatementNode(methodCallNode(identifierNode("db"), "update", [identifierNode("users")])),
					expressionStatementNode(
						asNode({
							type: "ArrowFunctionExpression",
							params: [],
							async: false,
							body: methodCallNode(identifierNode("db"), "transaction"),
						}),
					),
				),
			]),
		);
		expect(reports).toHaveLength(1);
	});
});
