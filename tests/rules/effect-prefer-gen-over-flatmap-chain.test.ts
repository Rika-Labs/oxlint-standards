import { describe, expect, it } from "bun:test";
import { effectPreferGenOverFlatmapChainRule } from "../../src/plugin/rules/effect-prefer-gen-over-flatmap-chain.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("effect-prefer-gen-over-flatmap-chain", () => {
	it("reports long flatMap chains", () => {
		const { context, reports } = createTestContext();
		const visitor = effectPreferGenOverFlatmapChainRule.create(context);

		const first = asNode({
			type: "CallExpression",
			callee: asNode({
				type: "MemberExpression",
				object: asNode({ type: "Identifier", name: "effectA" }),
				property: asNode({ type: "Identifier", name: "flatMap" }),
			}),
		});

		const second = asNode({
			type: "CallExpression",
			callee: asNode({
				type: "MemberExpression",
				object: first,
				property: asNode({ type: "Identifier", name: "flatMap" }),
			}),
		});

		const third = asNode({
			type: "CallExpression",
			callee: asNode({
				type: "MemberExpression",
				object: second,
				property: asNode({ type: "Identifier", name: "flatMap" }),
			}),
		});

		visitor.CallExpression?.(third);
		expect(reports).toHaveLength(1);
	});
});
