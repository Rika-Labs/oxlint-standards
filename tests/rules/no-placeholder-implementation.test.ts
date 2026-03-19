import { describe, expect, it } from "bun:test";
import { noPlaceholderImplementationRule } from "../../src/plugin/rules/no-placeholder-implementation.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-placeholder-implementation", () => {
	it("reports comments containing placeholder markers like TODO implement later", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noPlaceholderImplementationRule.create(context);

		visitor.Program?.(
			asNode({
				type: "Program",
				comments: [
					asNode({
						type: "Line",
						value: "TODO implement later",
					}),
				],
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("placeholder");
	});

	it("reports string literals containing lorem ipsum", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noPlaceholderImplementationRule.create(context);

		visitor.Literal?.(
			asNode({
				type: "Literal",
				value: "lorem ipsum dolor sit amet",
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("placeholder");
	});

	it("reports banned identifier names like foo", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noPlaceholderImplementationRule.create(context);

		visitor.Identifier?.(
			asNode({
				type: "Identifier",
				name: "foo",
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("bannedIdentifier");
	});

	it("ignores regular comments without placeholder markers", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noPlaceholderImplementationRule.create(context);

		visitor.Program?.(
			asNode({
				type: "Program",
				comments: [
					asNode({
						type: "Line",
						value: "This function handles user authentication",
					}),
				],
			}),
		);

		expect(reports).toHaveLength(0);
	});

	it("does not report anything in test files", () => {
		const { context } = createTestContext("src/service.test.ts");
		const visitor = noPlaceholderImplementationRule.create(context);

		// Visitor should be empty for test files
		expect(visitor.Program).toBeUndefined();
		expect(visitor.Literal).toBeUndefined();
		expect(visitor.Identifier).toBeUndefined();
	});
});
