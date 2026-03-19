import { describe, expect, it } from "bun:test";
import { noIdenticalBranchesRule } from "../../src/plugin/rules/no-identical-branches.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-identical-branches", () => {
	it("reports IfStatement with identical consequent and alternate", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noIdenticalBranchesRule.create(context);

		const sharedBlock = {
			type: "BlockStatement" as const,
			body: [
				asNode({
					type: "ReturnStatement",
					argument: asNode({ type: "Literal", value: 42 }),
				}),
			],
		};

		visitor.IfStatement?.(
			asNode({
				type: "IfStatement",
				test: asNode({ type: "Identifier", name: "condition" }),
				consequent: asNode(sharedBlock),
				alternate: asNode(sharedBlock),
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("identicalBranches");
	});

	it("does not report IfStatement with different consequent and alternate", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noIdenticalBranchesRule.create(context);

		visitor.IfStatement?.(
			asNode({
				type: "IfStatement",
				test: asNode({ type: "Identifier", name: "condition" }),
				consequent: asNode({
					type: "BlockStatement",
					body: [
						asNode({
							type: "ReturnStatement",
							argument: asNode({ type: "Literal", value: 42 }),
						}),
					],
				}),
				alternate: asNode({
					type: "BlockStatement",
					body: [
						asNode({
							type: "ReturnStatement",
							argument: asNode({ type: "Literal", value: 99 }),
						}),
					],
				}),
			}),
		);

		expect(reports).toHaveLength(0);
	});

	it("reports ConditionalExpression with identical branches", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noIdenticalBranchesRule.create(context);

		visitor.ConditionalExpression?.(
			asNode({
				type: "ConditionalExpression",
				test: asNode({ type: "Identifier", name: "flag" }),
				consequent: asNode({ type: "Literal", value: "same" }),
				alternate: asNode({ type: "Literal", value: "same" }),
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("identicalBranches");
	});
});
