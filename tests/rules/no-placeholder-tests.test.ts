import { describe, expect, it } from "bun:test";
import { noPlaceholderTestsRule } from "../../src/plugin/rules/no-placeholder-tests.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-placeholder-tests", () => {
	it("reports empty test bodies", () => {
		const { context, reports } = createTestContext("src/service.test.ts");
		const visitor = noPlaceholderTestsRule.create(context);

		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({ type: "Identifier", name: "it" }),
				arguments: [
					asNode({ type: "Literal", value: "does the thing" }),
					asNode({
						type: "ArrowFunctionExpression",
						body: asNode({ type: "BlockStatement", body: [] }),
					}),
				],
			}),
		);

		expect(reports[0]?.messageId).toBe("placeholder");
	});

	it("reports placeholder-only AI diff tests", () => {
		const { context, reports } = createTestContext("src/service.test.ts");
		const visitor = noPlaceholderTestsRule.create(context);

		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({ type: "Identifier", name: "test" }),
				arguments: [
					asNode({ type: "Literal", value: "handles user input" }),
					asNode({
						type: "ArrowFunctionExpression",
						body: asNode({
							type: "BlockStatement",
							body: [
								asNode({
									type: "ExpressionStatement",
									expression: asNode({ type: "Literal", value: "TODO implement later" }),
								}),
							],
						}),
					}),
				],
			}),
		);

		expect(reports[0]?.messageId).toBe("placeholder");
	});

	it("ignores real tests", () => {
		const { context, reports } = createTestContext("src/service.test.ts");
		const visitor = noPlaceholderTestsRule.create(context);

		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({ type: "Identifier", name: "it" }),
				arguments: [
					asNode({ type: "Literal", value: "works" }),
					asNode({
						type: "ArrowFunctionExpression",
						body: asNode({
							type: "BlockStatement",
							body: [
								asNode({
									type: "ExpressionStatement",
									expression: asNode({
										type: "CallExpression",
										callee: asNode({ type: "Identifier", name: "expect" }),
									}),
								}),
							],
						}),
					}),
				],
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
