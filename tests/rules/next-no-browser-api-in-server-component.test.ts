import { describe, expect, it } from "bun:test";
import { nextNoBrowserApiInServerComponentRule } from "../../src/plugin/rules/next-no-browser-api-in-server-component.ts";
import {
	createTestContext,
	expressionStatementNode,
	identifierNode,
	literalNode,
	memberExpressionNode,
	programNode,
} from "./helpers.ts";

describe("next-no-browser-api-in-server-component", () => {
	it("reports browser APIs in server components", () => {
		const { context, reports } = createTestContext("src/app/users/page.tsx");
		const visitor = nextNoBrowserApiInServerComponentRule.create(context);
		visitor.Program?.(
			programNode([expressionStatementNode(memberExpressionNode(identifierNode("window"), "location"))]),
		);
		expect(reports).toHaveLength(1);
	});

	it("allows browser APIs in client components", () => {
		const { context, reports } = createTestContext("src/app/users/page.tsx");
		const visitor = nextNoBrowserApiInServerComponentRule.create(context);
		visitor.Program?.(
			programNode([
				expressionStatementNode(literalNode("use client")),
				expressionStatementNode(memberExpressionNode(identifierNode("window"), "location")),
			]),
		);
		expect(reports).toHaveLength(0);
	});
});
