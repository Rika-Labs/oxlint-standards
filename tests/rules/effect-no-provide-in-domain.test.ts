import { describe, expect, it } from "bun:test";
import { effectNoProvideInDomainRule } from "../../src/plugin/rules/effect-no-provide-in-domain.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("effect-no-provide-in-domain", () => {
	it("reports Effect.provide in domain file", () => {
		const { context, reports } = createTestContext("src/domain/service.ts");
		const visitor = effectNoProvideInDomainRule.create(context);

		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "Effect" }),
					property: asNode({ type: "Identifier", name: "provide" }),
				}),
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("forbidden");
	});

	it("does not report Effect.provide in composition root file", () => {
		const { context } = createTestContext("src/composition.ts");
		const visitor = effectNoProvideInDomainRule.create(context);

		// visitor should be empty object for composition root files
		expect(Object.keys(visitor)).toHaveLength(0);
	});

	it("does not report Effect.provide in composition root directory", () => {
		const { context } = createTestContext("src/providers/http.ts");
		const visitor = effectNoProvideInDomainRule.create(context);

		expect(Object.keys(visitor)).toHaveLength(0);
	});

	it("does not report Effect.provide in test file", () => {
		const { context } = createTestContext("src/example.test.ts");
		const visitor = effectNoProvideInDomainRule.create(context);

		// visitor should be empty object for test files
		expect(Object.keys(visitor)).toHaveLength(0);
	});
});
