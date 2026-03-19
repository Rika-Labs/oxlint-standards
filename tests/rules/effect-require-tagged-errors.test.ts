import { describe, expect, it } from "bun:test";
import { effectRequireTaggedErrorsRule } from "../../src/plugin/rules/effect-require-tagged-errors.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("effect-require-tagged-errors", () => {
	it("reports Effect.fail with a Literal argument", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = effectRequireTaggedErrorsRule.create(context);

		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "Effect" }),
					property: asNode({ type: "Identifier", name: "fail" }),
				}),
				arguments: [
					asNode({ type: "Literal", value: "error" }),
				],
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("untagged");
	});

	it("allows Effect.fail with a NewExpression (custom error class)", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = effectRequireTaggedErrorsRule.create(context);

		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "Effect" }),
					property: asNode({ type: "Identifier", name: "fail" }),
				}),
				arguments: [
					asNode({
						type: "NewExpression",
						callee: asNode({ type: "Identifier", name: "UserNotFoundError" }),
					}),
				],
			}),
		);

		expect(reports).toHaveLength(0);
	});

	it("reports Effect.fail with an Identifier argument", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = effectRequireTaggedErrorsRule.create(context);

		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "Effect" }),
					property: asNode({ type: "Identifier", name: "fail" }),
				}),
				arguments: [
					asNode({ type: "Identifier", name: "someVar" }),
				],
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("untagged");
	});
});
