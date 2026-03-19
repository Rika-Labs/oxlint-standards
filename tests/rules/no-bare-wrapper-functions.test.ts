import { describe, expect, it } from "bun:test";
import { noBareWrapperFunctionsRule } from "../../src/plugin/rules/no-bare-wrapper-functions.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-bare-wrapper-functions", () => {
	it("reports direct pass-through wrappers", () => {
		const { context, reports } = createTestContext();
		const visitor = noBareWrapperFunctionsRule.create(context);

		visitor.FunctionDeclaration?.(
			asNode({
				type: "FunctionDeclaration",
				id: asNode({ type: "Identifier", name: "processData" }),
				params: [asNode({ type: "Identifier", name: "data" })],
				body: asNode({
					type: "BlockStatement",
					body: [
						asNode({
							type: "ReturnStatement",
							argument: asNode({
								type: "CallExpression",
								callee: asNode({ type: "Identifier", name: "doSomething" }),
								arguments: [asNode({ type: "Identifier", name: "data" })],
							}),
						}),
					],
				}),
			}),
		);

		expect(reports[0]?.messageId).toBe("wrapper");
	});

	it("ignores functions with real behavior", () => {
		const { context, reports } = createTestContext();
		const visitor = noBareWrapperFunctionsRule.create(context);

		visitor.FunctionDeclaration?.(
			asNode({
				type: "FunctionDeclaration",
				id: asNode({ type: "Identifier", name: "normalizeName" }),
				params: [asNode({ type: "Identifier", name: "name" })],
				body: asNode({
					type: "BlockStatement",
					body: [
						asNode({
							type: "ReturnStatement",
							argument: asNode({
								type: "CallExpression",
								callee: asNode({ type: "Identifier", name: "trim" }),
								arguments: [asNode({ type: "Literal", value: "name" })],
							}),
						}),
					],
				}),
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
