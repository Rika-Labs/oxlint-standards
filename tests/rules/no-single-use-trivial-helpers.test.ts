import { describe, expect, it } from "bun:test";
import { noSingleUseTrivialHelpersRule } from "../../src/plugin/rules/no-single-use-trivial-helpers.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-single-use-trivial-helpers", () => {
	it("reports tiny file-local helpers used once", () => {
		const { context, reports } = createTestContext();
		const visitor = noSingleUseTrivialHelpersRule.create(context);

		visitor.Program?.(
			asNode({
				type: "Program",
				body: [
					asNode({
						type: "FunctionDeclaration",
						id: asNode({ type: "Identifier", name: "trimName" }),
						body: asNode({
							type: "BlockStatement",
							body: [
								asNode({
									type: "ReturnStatement",
									argument: asNode({ type: "Identifier", name: "name" }),
								}),
							],
						}),
					}),
					asNode({
						type: "ExpressionStatement",
						expression: asNode({
							type: "CallExpression",
							callee: asNode({ type: "Identifier", name: "trimName" }),
						}),
					}),
				],
			}),
		);

		expect(reports[0]?.messageId).toBe("singleUse");
	});

	it("ignores helpers used more than once", () => {
		const { context, reports } = createTestContext();
		const visitor = noSingleUseTrivialHelpersRule.create(context);

		visitor.Program?.(
			asNode({
				type: "Program",
				body: [
					asNode({
						type: "FunctionDeclaration",
						id: asNode({ type: "Identifier", name: "trimName" }),
						body: asNode({
							type: "BlockStatement",
							body: [asNode({ type: "ReturnStatement", argument: asNode({ type: "Identifier", name: "name" }) })],
						}),
					}),
					asNode({
						type: "ExpressionStatement",
						expression: asNode({ type: "CallExpression", callee: asNode({ type: "Identifier", name: "trimName" }) }),
					}),
					asNode({
						type: "ExpressionStatement",
						expression: asNode({ type: "CallExpression", callee: asNode({ type: "Identifier", name: "trimName" }) }),
					}),
				],
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
