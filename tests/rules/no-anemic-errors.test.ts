import { describe, expect, it } from "bun:test";
import { noAnemicErrorsRule } from "../../src/plugin/rules/no-anemic-errors.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-anemic-errors", () => {
	it("reports throw new Error with a vague message like 'Failed'", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noAnemicErrorsRule.create(context);

		visitor.ThrowStatement?.(
			asNode({
				type: "ThrowStatement",
				argument: asNode({
					type: "NewExpression",
					callee: asNode({ type: "Identifier", name: "Error" }),
					arguments: [
						asNode({ type: "Literal", value: "Failed" }),
					],
				}),
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("anemicThrow");
	});

	it("allows throw new Error with a descriptive message", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noAnemicErrorsRule.create(context);

		visitor.ThrowStatement?.(
			asNode({
				type: "ThrowStatement",
				argument: asNode({
					type: "NewExpression",
					callee: asNode({ type: "Identifier", name: "Error" }),
					arguments: [
						asNode({ type: "Literal", value: "User not found in database" }),
					],
				}),
			}),
		);

		expect(reports).toHaveLength(0);
	});

	it("reports return { success: false, error: 'Error' } with vague error", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noAnemicErrorsRule.create(context);

		visitor.ReturnStatement?.(
			asNode({
				type: "ReturnStatement",
				argument: asNode({
					type: "ObjectExpression",
					properties: [
						asNode({
							type: "Property",
							key: asNode({ type: "Identifier", name: "success" }),
							value: asNode({ type: "Literal", value: false }),
						}),
						asNode({
							type: "Property",
							key: asNode({ type: "Identifier", name: "error" }),
							value: asNode({ type: "Literal", value: "Error" }),
						}),
					],
				}),
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("anemicReturn");
	});

	it("allows return { success: false, error: 'User account is suspended' }", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noAnemicErrorsRule.create(context);

		visitor.ReturnStatement?.(
			asNode({
				type: "ReturnStatement",
				argument: asNode({
					type: "ObjectExpression",
					properties: [
						asNode({
							type: "Property",
							key: asNode({ type: "Identifier", name: "success" }),
							value: asNode({ type: "Literal", value: false }),
						}),
						asNode({
							type: "Property",
							key: asNode({ type: "Identifier", name: "error" }),
							value: asNode({ type: "Literal", value: "User account is suspended" }),
						}),
					],
				}),
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
