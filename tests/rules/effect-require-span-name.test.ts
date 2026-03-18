import { describe, expect, it } from "bun:test";
import { effectRequireSpanNameRule } from "../../src/plugin/rules/effect-require-span-name.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("effect-require-span-name", () => {
	it("reports invalid Effect.fn span name", () => {
		const { context, reports } = createTestContext();
		const visitor = effectRequireSpanNameRule.create(context);
		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "Effect" }),
					property: asNode({ type: "Identifier", name: "fn" }),
				}),
				arguments: [asNode({ type: "Literal", value: "badspanname" })],
			}),
		);
		expect(reports).toHaveLength(1);
	});

	it("accepts ClassName.methodName format for Effect.fn", () => {
		const { context, reports } = createTestContext();
		const visitor = effectRequireSpanNameRule.create(context);
		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "Effect" }),
					property: asNode({ type: "Identifier", name: "fn" }),
				}),
				arguments: [asNode({ type: "Literal", value: "UserService.create" })],
			}),
		);
		expect(reports).toHaveLength(0);
	});
});
