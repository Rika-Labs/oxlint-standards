import { describe, expect, it } from "bun:test";
import { effectPreferRunmainEntrypointRule } from "../../src/plugin/rules/effect-prefer-runmain-entrypoint.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("effect-prefer-runmain-entrypoint", () => {
	it("reports Effect.runPromise in entrypoint file", () => {
		const { context, reports } = createTestContext("src/main.ts");
		const visitor = effectPreferRunmainEntrypointRule.create(context);

		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "Effect" }),
					property: asNode({ type: "Identifier", name: "runPromise" }),
				}),
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("preferRunMain");
	});

	it("does not report Effect.runPromise in non-entrypoint file", () => {
		const { context } = createTestContext("src/service.ts");
		const visitor = effectPreferRunmainEntrypointRule.create(context);

		// visitor should be empty object for non-entrypoint files
		expect(Object.keys(visitor)).toHaveLength(0);
	});

	it("does not report Effect.runPromise in test file", () => {
		const { context } = createTestContext("src/main.test.ts");
		const visitor = effectPreferRunmainEntrypointRule.create(context);

		// visitor should be empty object for test files
		expect(Object.keys(visitor)).toHaveLength(0);
	});
});
