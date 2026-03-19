import { describe, expect, it } from "bun:test";
import { noPropertyDefaultFallbacksRule } from "../../src/plugin/rules/no-property-default-fallbacks.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-property-default-fallbacks", () => {
	it("reports property access defaults hidden behind nullish coalescing", () => {
		const { context, reports } = createTestContext();
		const visitor = noPropertyDefaultFallbacksRule.create(context);

		visitor.LogicalExpression?.(
			asNode({
				type: "LogicalExpression",
				operator: "??",
				left: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "user" }),
					property: asNode({ type: "Identifier", name: "name" }),
					computed: false,
				}),
				right: asNode({ type: "Literal", value: "" }),
			}),
		);

		expect(reports[0]?.messageId).toBe("fallback");
	});

	it("ignores non-property fallbacks", () => {
		const { context, reports } = createTestContext();
		const visitor = noPropertyDefaultFallbacksRule.create(context);

		visitor.LogicalExpression?.(
			asNode({
				type: "LogicalExpression",
				operator: "??",
				left: asNode({ type: "Identifier", name: "name" }),
				right: asNode({ type: "Literal", value: "" }),
			}),
		);

		expect(reports).toHaveLength(0);
	});

	it("reports ternaries that guard the same property access", () => {
		const { context, reports } = createTestContext();
		const visitor = noPropertyDefaultFallbacksRule.create(context);

		visitor.ConditionalExpression?.(
			asNode({
				type: "ConditionalExpression",
				test: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "user" }),
					property: asNode({ type: "Identifier", name: "name" }),
					computed: false,
				}),
				consequent: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "user" }),
					property: asNode({ type: "Identifier", name: "name" }),
					computed: false,
				}),
				alternate: asNode({ type: "Literal", value: "" }),
			}),
		);

		expect(reports[0]?.messageId).toBe("fallback");
	});

	it("ignores ordinary conditionals with unrelated tests", () => {
		const { context, reports } = createTestContext();
		const visitor = noPropertyDefaultFallbacksRule.create(context);

		visitor.ConditionalExpression?.(
			asNode({
				type: "ConditionalExpression",
				test: asNode({ type: "Identifier", name: "isGuest" }),
				consequent: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "user" }),
					property: asNode({ type: "Identifier", name: "name" }),
					computed: false,
				}),
				alternate: asNode({ type: "Literal", value: "anonymous" }),
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
