import { describe, expect, it } from "bun:test";
import { effectNoFireAndForgetForkRule } from "../../src/plugin/rules/effect-no-fire-and-forget-fork.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("effect-no-fire-and-forget-fork", () => {
	it("reports ExpressionStatement wrapping Effect.fork call", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = effectNoFireAndForgetForkRule.create(context);

		visitor.ExpressionStatement?.(
			asNode({
				type: "ExpressionStatement",
				expression: asNode({
					type: "CallExpression",
					callee: asNode({
						type: "MemberExpression",
						object: asNode({ type: "Identifier", name: "Effect" }),
						property: asNode({ type: "Identifier", name: "fork" }),
					}),
					arguments: [
						asNode({ type: "Identifier", name: "myEffect" }),
					],
				}),
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("fireAndForget");
	});

	it("does not report ExpressionStatement with a non-fork call", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = effectNoFireAndForgetForkRule.create(context);

		visitor.ExpressionStatement?.(
			asNode({
				type: "ExpressionStatement",
				expression: asNode({
					type: "CallExpression",
					callee: asNode({
						type: "MemberExpression",
						object: asNode({ type: "Identifier", name: "Effect" }),
						property: asNode({ type: "Identifier", name: "runSync" }),
					}),
					arguments: [
						asNode({ type: "Identifier", name: "myEffect" }),
					],
				}),
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
