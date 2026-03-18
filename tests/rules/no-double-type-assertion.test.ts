import { describe, expect, it } from "bun:test";
import { noDoubleTypeAssertionRule } from "../../src/plugin/rules/no-double-type-assertion.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-double-type-assertion", () => {
	it("reports nested TSAsExpression chains", () => {
		const { context, reports } = createTestContext();
		const visitor = noDoubleTypeAssertionRule.create(context);

		visitor.TSAsExpression?.(
			asNode({
				type: "TSAsExpression",
				expression: asNode({
					type: "TSAsExpression",
					expression: asNode({ type: "Identifier", name: "value" }),
				}),
			}),
		);

		expect(reports).toHaveLength(1);
	});

	it("allows single assertions", () => {
		const { context, reports } = createTestContext();
		const visitor = noDoubleTypeAssertionRule.create(context);

		visitor.TSAsExpression?.(
			asNode({
				type: "TSAsExpression",
				expression: asNode({ type: "Identifier", name: "value" }),
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
