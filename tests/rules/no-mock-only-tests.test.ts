import { describe, expect, it } from "bun:test";
import { noMockOnlyTestsRule } from "../../src/plugin/rules/no-mock-only-tests.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-mock-only-tests", () => {
	it("reports tests that only configure mocks", () => {
		const { context, reports } = createTestContext("src/service.test.ts");
		const visitor = noMockOnlyTestsRule.create(context);

		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({ type: "Identifier", name: "it" }),
				arguments: [
					asNode({ type: "Literal", value: "loads users" }),
					asNode({
						type: "ArrowFunctionExpression",
						body: asNode({
							type: "BlockStatement",
							body: [
								asNode({
									type: "ExpressionStatement",
									expression: asNode({
										type: "CallExpression",
										callee: asNode({
											type: "MemberExpression",
											object: asNode({ type: "Identifier", name: "jest" }),
											property: asNode({ type: "Identifier", name: "spyOn" }),
											computed: false,
										}),
									}),
								}),
							],
						}),
					}),
				],
			}),
		);

		expect(reports[0]?.messageId).toBe("mockOnly");
	});

	it("ignores tests with assertions", () => {
		const { context, reports } = createTestContext("src/service.test.ts");
		const visitor = noMockOnlyTestsRule.create(context);

		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({ type: "Identifier", name: "it" }),
				arguments: [
					asNode({ type: "Literal", value: "loads users" }),
					asNode({
						type: "ArrowFunctionExpression",
						body: asNode({
							type: "BlockStatement",
							body: [
								asNode({
									type: "ExpressionStatement",
									expression: asNode({
										type: "CallExpression",
										callee: asNode({
											type: "MemberExpression",
											object: asNode({ type: "Identifier", name: "jest" }),
											property: asNode({ type: "Identifier", name: "spyOn" }),
											computed: false,
										}),
									}),
								}),
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
