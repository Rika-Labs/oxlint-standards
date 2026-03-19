import { describe, expect, it } from "bun:test";
import { drizzleNoDriverQueryInDomainRule } from "../../src/plugin/rules/drizzle-no-driver-query-in-domain.ts";
import {
	createTestContext,
	expressionStatementNode,
	identifierNode,
	importDeclarationNode,
	memberExpressionNode,
	methodCallNode,
	programNode,
} from "./helpers.ts";

describe("drizzle-no-driver-query-in-domain", () => {
	it("reports direct postgres.query usage", () => {
		const { context, reports } = createTestContext("src/domain/user-repo.ts");
		const visitor = drizzleNoDriverQueryInDomainRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("drizzle-orm"),
				expressionStatementNode(methodCallNode(identifierNode("postgres"), "query", [identifierNode("sqlText")])),
			]),
		);
		expect(reports).toHaveLength(1);
	});

	it("allows relational db.query.users.findMany() chains", () => {
		const { context, reports } = createTestContext("src/domain/user-repo.ts");
		const visitor = drizzleNoDriverQueryInDomainRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("drizzle-orm"),
				expressionStatementNode(
					methodCallNode(
						memberExpressionNode(memberExpressionNode(identifierNode("db"), "query"), "users"),
						"findMany",
					),
				),
			]),
		);
		expect(reports).toHaveLength(0);
	});
});
