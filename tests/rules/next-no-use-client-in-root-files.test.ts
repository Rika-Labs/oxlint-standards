import { describe, expect, it } from "bun:test";
import { nextNoUseClientInRootFilesRule } from "../../src/plugin/rules/next-no-use-client-in-root-files.ts";
import { createTestContext, expressionStatementNode, literalNode, programNode } from "./helpers.ts";

describe("next-no-use-client-in-root-files", () => {
	it("reports use client in page files", () => {
		const { context, reports } = createTestContext("src/app/users/page.tsx");
		const visitor = nextNoUseClientInRootFilesRule.create(context);
		visitor.Program?.(programNode([expressionStatementNode(literalNode("use client"))]));
		expect(reports).toHaveLength(1);
	});

	it("allows use client in nested components", () => {
		const { context, reports } = createTestContext("src/app/users/client-widget.tsx");
		const visitor = nextNoUseClientInRootFilesRule.create(context);
		visitor.Program?.(programNode([expressionStatementNode(literalNode("use client"))]));
		expect(reports).toHaveLength(0);
	});

	it("allows use client in error boundaries", () => {
		const { context, reports } = createTestContext("src/app/users/error.tsx");
		const visitor = nextNoUseClientInRootFilesRule.create(context);
		visitor.Program?.(programNode([expressionStatementNode(literalNode("use client"))]));
		expect(reports).toHaveLength(0);
	});
});
