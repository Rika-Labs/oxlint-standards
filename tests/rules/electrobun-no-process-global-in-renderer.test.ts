import { describe, expect, it } from "bun:test";
import { electrobunNoProcessGlobalInRendererRule } from "../../src/plugin/rules/electrobun-no-process-global-in-renderer.ts";
import { createTestContext, expressionStatementNode, identifierNode, memberExpressionNode, programNode } from "./helpers.ts";

describe("electrobun-no-process-global-in-renderer", () => {
	it("reports process.env in renderer files", () => {
		const { context, reports } = createTestContext("src/mainview/features/app.ts");
		const visitor = electrobunNoProcessGlobalInRendererRule.create(context);
		visitor.Program?.(
			programNode([
				expressionStatementNode(
					memberExpressionNode(identifierNode("process"), "env"),
				),
			]),
		);
		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("processInRenderer");
	});

	it("reports process.exit in renderer files", () => {
		const { context, reports } = createTestContext("src/mainview/index.ts");
		const visitor = electrobunNoProcessGlobalInRendererRule.create(context);
		visitor.Program?.(
			programNode([
				expressionStatementNode(
					memberExpressionNode(identifierNode("process"), "exit"),
				),
			]),
		);
		expect(reports).toHaveLength(1);
	});

	it("allows process.env outside renderer", () => {
		const { context } = createTestContext("src/bun/config.ts");
		const visitor = electrobunNoProcessGlobalInRendererRule.create(context);
		expect(Object.keys(visitor)).toHaveLength(0);
	});

	it("ignores test files", () => {
		const { context } = createTestContext("src/mainview/app.test.ts");
		const visitor = electrobunNoProcessGlobalInRendererRule.create(context);
		expect(Object.keys(visitor)).toHaveLength(0);
	});
});
