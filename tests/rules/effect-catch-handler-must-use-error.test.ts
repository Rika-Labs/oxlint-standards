import { describe, expect, it } from "bun:test";
import { effectCatchHandlerMustUseErrorRule } from "../../src/plugin/rules/effect-catch-handler-must-use-error.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("effect-catch-handler-must-use-error", () => {
	it("reports Effect.catchTag handlers without an error parameter", () => {
		const { context, reports } = createTestContext();
		const visitor = effectCatchHandlerMustUseErrorRule.create(context);

		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "Effect" }),
					property: asNode({ type: "Identifier", name: "catchTag" }),
				}),
				arguments: [
					asNode({ type: "Literal", value: "MyError" }),
					asNode({
						type: "ArrowFunctionExpression",
						params: [],
						body: asNode({ type: "Literal", value: null }),
					}),
				],
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("missing");
	});

	it("reports Effect.catch handlers with unused error parameter", () => {
		const { context, reports } = createTestContext();
		const visitor = effectCatchHandlerMustUseErrorRule.create(context);

		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "Effect" }),
					property: asNode({ type: "Identifier", name: "catch" }),
				}),
				arguments: [
					asNode({
						type: "ArrowFunctionExpression",
						params: [asNode({ type: "Identifier", name: "error" })],
						body: asNode({ type: "Literal", value: null }),
					}),
				],
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("unused");
	});

	it("accepts handlers that read the error parameter", () => {
		const { context, reports } = createTestContext();
		const visitor = effectCatchHandlerMustUseErrorRule.create(context);

		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "Effect" }),
					property: asNode({ type: "Identifier", name: "catch" }),
				}),
				arguments: [
					asNode({
						type: "ArrowFunctionExpression",
						params: [asNode({ type: "Identifier", name: "error" })],
						body: asNode({
							type: "CallExpression",
							callee: asNode({
								type: "MemberExpression",
								object: asNode({ type: "Identifier", name: "Effect" }),
								property: asNode({ type: "Identifier", name: "fail" }),
							}),
							arguments: [asNode({ type: "Identifier", name: "error" })],
						}),
					}),
				],
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
