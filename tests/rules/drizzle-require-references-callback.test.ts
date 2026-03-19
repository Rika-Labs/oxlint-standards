import { describe, expect, it } from "bun:test";
import { drizzleRequireReferencesCallbackRule } from "../../src/plugin/rules/drizzle-require-references-callback.ts";
import {
	asNode,
	createTestContext,
	expressionStatementNode,
	identifierNode,
	importDeclarationNode,
	memberExpressionNode,
	methodCallNode,
	programNode,
} from "./helpers.ts";

describe("drizzle-require-references-callback", () => {
	it("reports eager references arguments", () => {
		const { context, reports } = createTestContext("src/schema/user-schema.ts");
		const visitor = drizzleRequireReferencesCallbackRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("drizzle-orm"),
				expressionStatementNode(
					methodCallNode(identifierNode("column"), "references", [
						memberExpressionNode(identifierNode("users"), "id"),
					]),
				),
			]),
		);
		expect(reports).toHaveLength(1);
	});

	it("allows callback references", () => {
		const { context, reports } = createTestContext("src/schema/user-schema.ts");
		const visitor = drizzleRequireReferencesCallbackRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("drizzle-orm"),
				expressionStatementNode(
					methodCallNode(identifierNode("column"), "references", [
						asNode({
							type: "ArrowFunctionExpression",
							params: [],
							async: false,
							body: memberExpressionNode(identifierNode("users"), "id"),
						}),
					]),
				),
			]),
		);
		expect(reports).toHaveLength(0);
	});
});
