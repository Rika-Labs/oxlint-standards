import { describe, expect, it } from "bun:test";
import { noCatchReturnErrorObjectRule } from "../../src/plugin/rules/no-catch-return-error-object.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-catch-return-error-object", () => {
	it("reports returning the caught error directly", () => {
		const { context, reports } = createTestContext();
		const visitor = noCatchReturnErrorObjectRule.create(context);

		visitor.CatchClause?.(
			asNode({
				type: "CatchClause",
				param: asNode({ type: "Identifier", name: "error" }),
				body: asNode({
					type: "BlockStatement",
					body: [
						asNode({
							type: "ReturnStatement",
							argument: asNode({ type: "Identifier", name: "error" }),
						}),
					],
				}),
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("forbidden");
	});

	it("allows catch blocks that return typed values", () => {
		const { context, reports } = createTestContext();
		const visitor = noCatchReturnErrorObjectRule.create(context);

		visitor.CatchClause?.(
			asNode({
				type: "CatchClause",
				param: asNode({ type: "Identifier", name: "error" }),
				body: asNode({
					type: "BlockStatement",
					body: [
						asNode({
							type: "ReturnStatement",
							argument: asNode({ type: "ObjectExpression", properties: [] }),
						}),
					],
				}),
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
