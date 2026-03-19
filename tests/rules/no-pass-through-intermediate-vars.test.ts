import { describe, expect, it } from "bun:test";
import { noPassThroughIntermediateVarsRule } from "../../src/plugin/rules/no-pass-through-intermediate-vars.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-pass-through-intermediate-vars", () => {
	it("reports aliases returned in the next statement", () => {
		const { context, reports } = createTestContext();
		const visitor = noPassThroughIntermediateVarsRule.create(context);

		visitor.BlockStatement?.(
			asNode({
				type: "BlockStatement",
				body: [
					asNode({
						type: "VariableDeclaration",
						declarations: [
							asNode({
								type: "VariableDeclarator",
								id: asNode({ type: "Identifier", name: "value" }),
								init: asNode({ type: "Identifier", name: "input" }),
							}),
						],
					}),
					asNode({
						type: "ReturnStatement",
						argument: asNode({ type: "Identifier", name: "value" }),
					}),
				],
			}),
		);

		expect(reports[0]?.messageId).toBe("passThrough");
	});

	it("ignores unrelated follow-up statements", () => {
		const { context, reports } = createTestContext();
		const visitor = noPassThroughIntermediateVarsRule.create(context);

		visitor.BlockStatement?.(
			asNode({
				type: "BlockStatement",
				body: [
					asNode({
						type: "VariableDeclaration",
						declarations: [
							asNode({
								type: "VariableDeclarator",
								id: asNode({ type: "Identifier", name: "value" }),
								init: asNode({ type: "Identifier", name: "input" }),
							}),
						],
					}),
					asNode({
						type: "ReturnStatement",
						argument: asNode({ type: "Identifier", name: "otherValue" }),
					}),
				],
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
