import { describe, expect, it } from "bun:test";
import { noAsNeverRule } from "../../src/plugin/rules/no-as-never.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-as-never", () => {
	it("reports TSAsExpression with TSNeverKeyword", () => {
		const { context, reports } = createTestContext();
		const visitor = noAsNeverRule.create(context);
		visitor.TSAsExpression?.(
			asNode({
				type: "TSAsExpression",
				typeAnnotation: asNode({ type: "TSNeverKeyword" }),
			}),
		);
		expect(reports).toHaveLength(1);
	});
});
