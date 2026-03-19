import { describe, expect, it } from "bun:test";
import { effectNoTacitUsageRule } from "../../src/plugin/rules/effect-no-tacit-usage.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("effect-no-tacit-usage", () => {
	it("reports tacit Identifier argument to Effect.map", () => {
		const { context, reports } = createTestContext("src/example.ts");
		const visitor = effectNoTacitUsageRule.create(context);

		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "Effect" }),
					property: asNode({ type: "Identifier", name: "map" }),
				}),
				arguments: [
					asNode({ type: "Identifier", name: "myFn" }),
				],
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("tacitEffect");
	});

	it("does not report ArrowFunctionExpression argument to Effect.map", () => {
		const { context, reports } = createTestContext("src/example.ts");
		const visitor = effectNoTacitUsageRule.create(context);

		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "Effect" }),
					property: asNode({ type: "Identifier", name: "map" }),
				}),
				arguments: [
					asNode({ type: "ArrowFunctionExpression" }),
				],
			}),
		);

		expect(reports).toHaveLength(0);
	});

	it("reports flow() call", () => {
		const { context, reports } = createTestContext("src/example.ts");
		const visitor = effectNoTacitUsageRule.create(context);

		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({ type: "Identifier", name: "flow" }),
				arguments: [
					asNode({ type: "Identifier", name: "fn1" }),
					asNode({ type: "Identifier", name: "fn2" }),
				],
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("tacitFlow");
	});
});
