import { describe, expect, it } from "bun:test";
import { noJsonStringifyDefaultFallbackRule } from "../../src/plugin/rules/no-json-stringify-default-fallback.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-json-stringify-default-fallback", () => {
	it("reports try/catch fallback around JSON.stringify", () => {
		const { context, reports } = createTestContext();
		const visitor = noJsonStringifyDefaultFallbackRule.create(context);

		visitor.TryStatement?.(
			asNode({
				type: "TryStatement",
				block: asNode({
					type: "BlockStatement",
					body: [
						asNode({
							type: "ExpressionStatement",
							expression: asNode({
								type: "CallExpression",
								callee: asNode({
									type: "MemberExpression",
									object: asNode({ type: "Identifier", name: "JSON" }),
									property: asNode({ type: "Identifier", name: "stringify" }),
								}),
							}),
						}),
					],
				}),
				handler: asNode({
					type: "CatchClause",
					body: asNode({
						type: "BlockStatement",
						body: [
							asNode({
								type: "ReturnStatement",
								argument: asNode({ type: "Literal", value: "{}" }),
							}),
						],
					}),
				}),
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("forbidden");
	});

	it("reports JSON.stringify || fallback patterns", () => {
		const { context, reports } = createTestContext();
		const visitor = noJsonStringifyDefaultFallbackRule.create(context);

		visitor.LogicalExpression?.(
			asNode({
				type: "LogicalExpression",
				operator: "||",
				left: asNode({
					type: "CallExpression",
					callee: asNode({
						type: "MemberExpression",
						object: asNode({ type: "Identifier", name: "JSON" }),
						property: asNode({ type: "Identifier", name: "stringify" }),
					}),
				}),
				right: asNode({ type: "Literal", value: "{}" }),
			}),
		);

		expect(reports).toHaveLength(1);
	});
});
