import { describe, expect, it } from "bun:test";
import { drizzleNoQueryInLoopsRule } from "../../src/plugin/rules/drizzle-no-query-in-loops.ts";
import {
	asNode,
	createTestContext,
	expressionStatementNode,
	identifierNode,
	importDeclarationNode,
	methodCallNode,
	programNode,
} from "./helpers.ts";

describe("drizzle-no-query-in-loops", () => {
	it("reports queries inside loops", () => {
		const { context, reports } = createTestContext("src/domain/user-repo.ts");
		const visitor = drizzleNoQueryInLoopsRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("drizzle-orm"),
				asNode({
					type: "ForOfStatement",
					left: identifierNode("userId"),
					right: identifierNode("userIds"),
					body: asNode({
						type: "BlockStatement",
						body: [
							expressionStatementNode(
								methodCallNode(
									methodCallNode(identifierNode("db"), "select"),
									"from",
									[identifierNode("users")],
								),
							),
						],
					}),
				}),
			]),
		);
		expect(reports).toHaveLength(1);
	});

	it("allows queries outside loops", () => {
		const { context, reports } = createTestContext("src/domain/user-repo.ts");
		const visitor = drizzleNoQueryInLoopsRule.create(context);
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
		expect(reports).toHaveLength(0);
	});
});
