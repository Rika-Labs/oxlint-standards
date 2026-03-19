import { describe, expect, it } from "bun:test";
import { drizzleEnforceUpdateWithWhereRule } from "../../src/plugin/rules/drizzle-enforce-update-with-where.ts";
import {
	createTestContext,
	expressionStatementNode,
	identifierNode,
	importDeclarationNode,
	methodCallNode,
	programNode,
} from "./helpers.ts";

describe("drizzle-enforce-update-with-where", () => {
	it("reports update queries without where", () => {
		const { context, reports } = createTestContext("src/domain/user-service.ts");
		const visitor = drizzleEnforceUpdateWithWhereRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("drizzle-orm"),
				expressionStatementNode(methodCallNode(identifierNode("db"), "update", [identifierNode("users")])),
			]),
		);
		expect(reports).toHaveLength(1);
	});

	it("allows update queries with where", () => {
		const { context, reports } = createTestContext("src/domain/user-service.ts");
		const visitor = drizzleEnforceUpdateWithWhereRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("drizzle-orm"),
				expressionStatementNode(
					methodCallNode(
						methodCallNode(identifierNode("db"), "update", [identifierNode("users")]),
						"where",
						[identifierNode("condition")],
					),
				),
			]),
		);
		expect(reports).toHaveLength(0);
	});
});
