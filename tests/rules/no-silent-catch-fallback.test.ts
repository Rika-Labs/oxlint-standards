import { describe, expect, it } from "bun:test";
import { noSilentCatchFallbackRule } from "../../src/plugin/rules/no-silent-catch-fallback.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-silent-catch-fallback", () => {
	it("reports fallback return in catch block", () => {
		const { context, reports } = createTestContext();
		const visitor = noSilentCatchFallbackRule.create(context);

		visitor.CatchClause?.(
			asNode({
				type: "CatchClause",
				body: asNode({
					type: "BlockStatement",
					body: [
						asNode({
							type: "ReturnStatement",
							argument: asNode({ type: "Literal", value: null }),
						}),
					],
				}),
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("fallback");
	});

	it("allows rethrowing catch blocks", () => {
		const { context, reports } = createTestContext();
		const visitor = noSilentCatchFallbackRule.create(context);

		visitor.CatchClause?.(
			asNode({
				type: "CatchClause",
				body: asNode({
					type: "BlockStatement",
					body: [
						asNode({
							type: "ThrowStatement",
							argument: asNode({ type: "Identifier", name: "error" }),
						}),
					],
				}),
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
