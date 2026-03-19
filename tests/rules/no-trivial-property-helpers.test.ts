import { describe, expect, it } from "bun:test";
import { noTrivialPropertyHelpersRule } from "../../src/plugin/rules/no-trivial-property-helpers.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-trivial-property-helpers", () => {
	it("reports getStringValue helpers with inline typeof checks", () => {
		const { context, reports } = createTestContext();
		const visitor = noTrivialPropertyHelpersRule.create(context);

		visitor.FunctionDeclaration?.(
			asNode({
				type: "FunctionDeclaration",
				id: asNode({ type: "Identifier", name: "getStringValue" }),
				body: asNode({
					type: "BlockStatement",
					body: [
						asNode({
							type: "ReturnStatement",
							argument: asNode({
								type: "ConditionalExpression",
								test: asNode({
									type: "UnaryExpression",
									operator: "typeof",
									argument: asNode({
										type: "MemberExpression",
										object: asNode({ type: "Identifier", name: "record" }),
										property: asNode({ type: "Identifier", name: "foo" }),
										computed: false,
									}),
								}),
								consequent: asNode({
									type: "MemberExpression",
									object: asNode({ type: "Identifier", name: "record" }),
									property: asNode({ type: "Identifier", name: "foo" }),
									computed: false,
								}),
								alternate: asNode({ type: "Literal", value: "" }),
							}),
						}),
					],
				}),
			}),
		);

		expect(reports[0]?.messageId).toBe("helper");
	});

	it("reports calls to safeGet helpers", () => {
		const { context, reports } = createTestContext();
		const visitor = noTrivialPropertyHelpersRule.create(context);

		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({ type: "Identifier", name: "safeGet" }),
			}),
		);

		expect(reports[0]?.messageId).toBe("call");
	});

	it("ignores domain-specific decoders", () => {
		const { context, reports } = createTestContext();
		const visitor = noTrivialPropertyHelpersRule.create(context);

		visitor.FunctionDeclaration?.(
			asNode({
				type: "FunctionDeclaration",
				id: asNode({ type: "Identifier", name: "decodeProfile" }),
				body: asNode({
					type: "BlockStatement",
					body: [
						asNode({
							type: "ReturnStatement",
							argument: asNode({
								type: "CallExpression",
								callee: asNode({ type: "Identifier", name: "Profile" }),
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
