import { describe, expect, it } from "bun:test";
import { bunNoBunSpecificInSharedRule } from "../../src/plugin/rules/bun-no-bun-specific-in-shared.ts";
import { createTestContext, expressionStatementNode, identifierNode, importDeclarationNode, memberExpressionNode, programNode } from "./helpers.ts";

describe("bun-no-bun-specific-in-shared", () => {
	it("reports bun: imports in shared packages", () => {
		const { context, reports } = createTestContext("packages/shared/src/utils.ts");
		const visitor = bunNoBunSpecificInSharedRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("bun:sqlite"),
			]),
		);
		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("bunImport");
	});

	it("reports Bun.file usage in shared packages", () => {
		const { context, reports } = createTestContext("packages/shared/src/io.ts");
		const visitor = bunNoBunSpecificInSharedRule.create(context);
		visitor.Program?.(
			programNode([
				expressionStatementNode(
					memberExpressionNode(identifierNode("Bun"), "file"),
				),
			]),
		);
		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("bunGlobal");
	});

	it("allows Bun APIs outside shared packages", () => {
		const { context } = createTestContext("packages/app/src/main.ts");
		const visitor = bunNoBunSpecificInSharedRule.create(context);
		expect(Object.keys(visitor)).toHaveLength(0);
	});

	it("ignores test files", () => {
		const { context } = createTestContext("packages/shared/src/utils.test.ts");
		const visitor = bunNoBunSpecificInSharedRule.create(context);
		expect(Object.keys(visitor)).toHaveLength(0);
	});
});
