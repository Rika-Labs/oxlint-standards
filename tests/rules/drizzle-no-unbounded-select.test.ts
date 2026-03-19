import { describe, expect, it } from "bun:test";
import { drizzleNoUnboundedSelectRule } from "../../src/plugin/rules/drizzle-no-unbounded-select.ts";
import {
	createTestContext,
	expressionStatementNode,
	identifierNode,
	importDeclarationNode,
	methodCallNode,
	programNode,
} from "./helpers.ts";

describe("drizzle-no-unbounded-select", () => {
	it("reports bare select().from(...) queries", () => {
		const { context, reports } = createTestContext("src/domain/user-repo.ts");
		const visitor = drizzleNoUnboundedSelectRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("drizzle-orm"),
				expressionStatementNode(
					methodCallNode(
						methodCallNode(identifierNode("db"), "select"),
						"from",
						[identifierNode("users")],
					),
				),
			]),
		);
		expect(reports).toHaveLength(1);
	});

	it("allows select().from(...).where(...)", () => {
		const { context, reports } = createTestContext("src/domain/user-repo.ts");
		const visitor = drizzleNoUnboundedSelectRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("drizzle-orm"),
				expressionStatementNode(
					methodCallNode(
						methodCallNode(
							methodCallNode(identifierNode("db"), "select"),
							"from",
							[identifierNode("users")],
						),
						"where",
						[identifierNode("condition")],
					),
				),
			]),
		);
		expect(reports).toHaveLength(0);
	});
});
