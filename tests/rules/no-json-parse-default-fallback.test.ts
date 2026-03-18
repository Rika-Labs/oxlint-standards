import { describe, expect, it } from "bun:test";
import { noJsonParseDefaultFallbackRule } from "../../src/plugin/rules/no-json-parse-default-fallback.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-json-parse-default-fallback", () => {
	it("reports try/catch fallback around JSON.parse", () => {
		const { context, reports } = createTestContext();
		const visitor = noJsonParseDefaultFallbackRule.create(context);

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
									property: asNode({ type: "Identifier", name: "parse" }),
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
								argument: asNode({ type: "ObjectExpression", properties: [] }),
							}),
						],
					}),
				}),
			}),
		);

		expect(reports).toHaveLength(1);
	});

	it("reports JSON.parse || {} patterns", () => {
		const { context, reports } = createTestContext();
		const visitor = noJsonParseDefaultFallbackRule.create(context);

		visitor.LogicalExpression?.(
			asNode({
				type: "LogicalExpression",
				operator: "||",
				left: asNode({
					type: "CallExpression",
					callee: asNode({
						type: "MemberExpression",
						object: asNode({ type: "Identifier", name: "JSON" }),
						property: asNode({ type: "Identifier", name: "parse" }),
					}),
				}),
				right: asNode({ type: "ObjectExpression", properties: [] }),
			}),
		);

		expect(reports).toHaveLength(1);
	});
});
