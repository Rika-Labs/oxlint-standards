import { describe, expect, it } from "bun:test";
import { effectNoGenericErrorFailRule } from "../../src/plugin/rules/effect-no-generic-error-fail.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("effect-no-generic-error-fail", () => {
	it("reports Effect.fail(new Error())", () => {
		const { context, reports } = createTestContext("src/domain/user-service.ts");
		const visitor = effectNoGenericErrorFailRule.create(context);
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
						callee: asNode({ type: "Identifier", name: "Error" }),
					}),
				],
			}),
		);
		expect(reports).toHaveLength(1);
	});
});
