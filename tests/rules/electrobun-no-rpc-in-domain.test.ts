import { describe, expect, it } from "bun:test";
import { electrobunNoRpcInDomainRule } from "../../src/plugin/rules/electrobun-no-rpc-in-domain.ts";
import { createTestContext, identifierNode, memberExpressionNode, methodCallNode, programNode, expressionStatementNode } from "./helpers.ts";

describe("electrobun-no-rpc-in-domain", () => {
	it("reports RPC calls in domain files", () => {
		const { context, reports } = createTestContext("src/domain/user-service.ts");
		const visitor = electrobunNoRpcInDomainRule.create(context);
		visitor.Program?.(
			programNode([
				expressionStatementNode(
					methodCallNode(
						memberExpressionNode(identifierNode("electroview"), "rpc"),
						"getUser",
					),
				),
			]),
		);
		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("rpcInDomain");
	});

	it("allows RPC calls in boundary files", () => {
		const { context, reports } = createTestContext("src/domain/rpc.ts");
		const visitor = electrobunNoRpcInDomainRule.create(context);
		visitor.Program?.(
			programNode([
				expressionStatementNode(
					methodCallNode(
						memberExpressionNode(identifierNode("electroview"), "rpc"),
						"getUser",
					),
				),
			]),
		);
		expect(reports).toHaveLength(0);
	});

	it("ignores files outside domain directories", () => {
		const { context, reports } = createTestContext("src/mainview/app.ts");
		const visitor = electrobunNoRpcInDomainRule.create(context);
		visitor.Program?.(
			programNode([
				expressionStatementNode(
					methodCallNode(
						memberExpressionNode(identifierNode("electroview"), "rpc"),
						"getUser",
					),
				),
			]),
		);
		expect(reports).toHaveLength(0);
	});

	it("ignores test files", () => {
		const { context } = createTestContext("src/domain/user-service.test.ts");
		const visitor = electrobunNoRpcInDomainRule.create(context);
		expect(Object.keys(visitor)).toHaveLength(0);
	});
});
