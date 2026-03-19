import { describe, expect, it } from "bun:test";
import { drizzleEnforceDeleteWithWhereRule } from "../../src/plugin/rules/drizzle-enforce-delete-with-where.ts";
import {
	createTestContext,
	expressionStatementNode,
	identifierNode,
	importDeclarationNode,
	methodCallNode,
	programNode,
} from "./helpers.ts";

describe("drizzle-enforce-delete-with-where", () => {
	it("reports delete queries without where", () => {
		const { context, reports } = createTestContext("src/domain/user-repo.ts");
		const visitor = drizzleEnforceDeleteWithWhereRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("drizzle-orm"),
				expressionStatementNode(methodCallNode(identifierNode("db"), "delete", [identifierNode("users")])),
			]),
		);
		expect(reports).toHaveLength(1);
	});

	it("allows delete queries with where", () => {
		const { context, reports } = createTestContext("src/domain/user-repo.ts");
		const visitor = drizzleEnforceDeleteWithWhereRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("drizzle-orm"),
				expressionStatementNode(
					methodCallNode(
						methodCallNode(identifierNode("db"), "delete", [identifierNode("users")]),
						"where",
						[identifierNode("condition")],
					),
				),
			]),
		);
		expect(reports).toHaveLength(0);
	});
});
