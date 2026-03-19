import { describe, expect, it } from "bun:test";
import { noTrivialRuntimeGuardHelpersRule } from "../../src/plugin/rules/no-trivial-runtime-guard-helpers.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-trivial-runtime-guard-helpers", () => {
	it("reports trivial isString helper declarations", () => {
		const { context, reports } = createTestContext();
		const visitor = noTrivialRuntimeGuardHelpersRule.create(context);

		visitor.FunctionDeclaration?.(
			asNode({
				type: "FunctionDeclaration",
				id: asNode({ type: "Identifier", name: "isString" }),
				body: asNode({
					type: "BlockStatement",
					body: [
						asNode({
							type: "ReturnStatement",
							argument: asNode({
								type: "BinaryExpression",
								operator: "===",
								left: asNode({
									type: "UnaryExpression",
									operator: "typeof",
									argument: asNode({ type: "Identifier", name: "value" }),
								}),
								right: asNode({ type: "Literal", value: "string" }),
							}),
						}),
					],
				}),
			}),
		);

		expect(reports[0]?.messageId).toBe("helper");
	});

	it("reports calls to isArray style helpers", () => {
		const { context, reports } = createTestContext();
		const visitor = noTrivialRuntimeGuardHelpersRule.create(context);

		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({ type: "Identifier", name: "isArray" }),
			}),
		);

		expect(reports[0]?.messageId).toBe("call");
	});

	it("ignores non-banned runtime checks", () => {
		const { context, reports } = createTestContext();
		const visitor = noTrivialRuntimeGuardHelpersRule.create(context);

		visitor.FunctionDeclaration?.(
			asNode({
				type: "FunctionDeclaration",
				id: asNode({ type: "Identifier", name: "hasValidUserShape" }),
				body: asNode({
					type: "BlockStatement",
					body: [
						asNode({
							type: "ReturnStatement",
							argument: asNode({
								type: "CallExpression",
								callee: asNode({ type: "Identifier", name: "decodeUser" }),
								arguments: [asNode({ type: "Identifier", name: "input" })],
							}),
						}),
					],
				}),
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
