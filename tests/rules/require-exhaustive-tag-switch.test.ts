import { describe, expect, it } from "bun:test";
import { requireExhaustiveTagSwitchRule } from "../../src/plugin/rules/require-exhaustive-tag-switch.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("require-exhaustive-tag-switch", () => {
	it("reports SwitchStatement on _tag without a default case", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = requireExhaustiveTagSwitchRule.create(context);

		visitor.SwitchStatement?.(
			asNode({
				type: "SwitchStatement",
				discriminant: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "action" }),
					property: asNode({ type: "Identifier", name: "_tag" }),
				}),
				cases: [
					asNode({
						type: "SwitchCase",
						test: asNode({ type: "Literal", value: "Create" }),
						consequent: [
							asNode({ type: "BreakStatement" }),
						],
					}),
					asNode({
						type: "SwitchCase",
						test: asNode({ type: "Literal", value: "Delete" }),
						consequent: [
							asNode({ type: "BreakStatement" }),
						],
					}),
				],
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("nonExhaustive");
	});

	it("allows SwitchStatement on _tag with a default case that throws", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = requireExhaustiveTagSwitchRule.create(context);

		visitor.SwitchStatement?.(
			asNode({
				type: "SwitchStatement",
				discriminant: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "action" }),
					property: asNode({ type: "Identifier", name: "_tag" }),
				}),
				cases: [
					asNode({
						type: "SwitchCase",
						test: asNode({ type: "Literal", value: "Create" }),
						consequent: [
							asNode({ type: "BreakStatement" }),
						],
					}),
					asNode({
						type: "SwitchCase",
						test: null,
						consequent: [
							asNode({
								type: "ThrowStatement",
								argument: asNode({
									type: "NewExpression",
									callee: asNode({ type: "Identifier", name: "Error" }),
									arguments: [asNode({ type: "Literal", value: "Unhandled tag" })],
								}),
							}),
						],
					}),
				],
			}),
		);

		expect(reports).toHaveLength(0);
	});

	it("does not report SwitchStatement on a regular property (not _tag/type/kind)", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = requireExhaustiveTagSwitchRule.create(context);

		visitor.SwitchStatement?.(
			asNode({
				type: "SwitchStatement",
				discriminant: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "obj" }),
					property: asNode({ type: "Identifier", name: "status" }),
				}),
				cases: [
					asNode({
						type: "SwitchCase",
						test: asNode({ type: "Literal", value: "active" }),
						consequent: [
							asNode({ type: "BreakStatement" }),
						],
					}),
				],
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
