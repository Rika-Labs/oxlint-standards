import { describe, expect, it } from "bun:test";
import { effectNoOrDieRule } from "../../src/plugin/rules/effect-no-or-die.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("effect-no-or-die", () => {
	it("reports Effect.orDie", () => {
		const { context, reports } = createTestContext("src/domain/user-service.ts");
		const visitor = effectNoOrDieRule.create(context);
		visitor.MemberExpression?.(
			asNode({
				type: "MemberExpression",
				object: asNode({ type: "Identifier", name: "Effect" }),
				property: asNode({ type: "Identifier", name: "orDie" }),
			}),
		);
		expect(reports).toHaveLength(1);
	});
});
