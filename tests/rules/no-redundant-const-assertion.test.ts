import { describe, expect, it } from "bun:test";
import { noRedundantConstAssertionRule } from "../../src/plugin/rules/no-redundant-const-assertion.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-redundant-const-assertion", () => {
	it("reports primitive literal as const assertions", () => {
		const { context, reports } = createTestContext();
		const visitor = noRedundantConstAssertionRule.create(context);

		visitor.TSAsExpression?.(
			asNode({
				type: "TSAsExpression",
				expression: asNode({ type: "Literal", value: "ready" }),
				typeAnnotation: asNode({
					type: "TSTypeReference",
					typeName: asNode({ type: "Identifier", name: "const" }),
				}),
			}),
		);

		expect(reports[0]?.messageId).toBe("redundant");
	});

	it("ignores object const assertions", () => {
		const { context, reports } = createTestContext();
		const visitor = noRedundantConstAssertionRule.create(context);

		visitor.TSAsExpression?.(
			asNode({
				type: "TSAsExpression",
				expression: asNode({ type: "ObjectExpression", properties: [] }),
				typeAnnotation: asNode({
					type: "TSTypeReference",
					typeName: asNode({ type: "Identifier", name: "const" }),
				}),
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
