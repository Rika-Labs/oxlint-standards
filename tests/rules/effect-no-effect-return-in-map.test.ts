import { describe, expect, it } from "bun:test";
import { effectNoEffectReturnInMapRule } from "../../src/plugin/rules/effect-no-effect-return-in-map.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("effect-no-effect-return-in-map", () => {
	it("reports returning Effect call inside array map callback", () => {
		const { context, reports } = createTestContext();
		const visitor = effectNoEffectReturnInMapRule.create(context);

		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "items" }),
					property: asNode({ type: "Identifier", name: "map" }),
				}),
				arguments: [
					asNode({
						type: "ArrowFunctionExpression",
						body: asNode({
							type: "CallExpression",
							callee: asNode({
								type: "MemberExpression",
								object: asNode({ type: "Identifier", name: "Effect" }),
								property: asNode({ type: "Identifier", name: "succeed" }),
							}),
						}),
					}),
				],
			}),
		);

		expect(reports).toHaveLength(1);
	});
});
