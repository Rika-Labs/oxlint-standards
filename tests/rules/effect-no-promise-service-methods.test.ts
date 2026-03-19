import { describe, expect, it } from "bun:test";
import { effectNoPromiseServiceMethodsRule } from "../../src/plugin/rules/effect-no-promise-service-methods.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("effect-no-promise-service-methods", () => {
	it("reports async MethodDefinition", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = effectNoPromiseServiceMethodsRule.create(context);

		visitor.MethodDefinition?.(
			asNode({
				type: "MethodDefinition",
				key: asNode({ type: "Identifier", name: "fetchUser" }),
				value: asNode({
					type: "FunctionExpression",
					async: true,
					params: [],
					body: asNode({ type: "BlockStatement", body: [] }),
				}),
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("asyncMethod");
	});

	it("allows non-async MethodDefinition without Promise return type", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = effectNoPromiseServiceMethodsRule.create(context);

		visitor.MethodDefinition?.(
			asNode({
				type: "MethodDefinition",
				key: asNode({ type: "Identifier", name: "fetchUser" }),
				value: asNode({
					type: "FunctionExpression",
					async: false,
					params: [],
					body: asNode({ type: "BlockStatement", body: [] }),
				}),
			}),
		);

		expect(reports).toHaveLength(0);
	});

	it("reports MethodDefinition with Promise return type", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = effectNoPromiseServiceMethodsRule.create(context);

		visitor.MethodDefinition?.(
			asNode({
				type: "MethodDefinition",
				key: asNode({ type: "Identifier", name: "fetchUser" }),
				value: asNode({
					type: "FunctionExpression",
					async: false,
					params: [],
					body: asNode({ type: "BlockStatement", body: [] }),
					returnType: asNode({
						type: "TSTypeAnnotation",
						typeAnnotation: asNode({
							type: "TSTypeReference",
							typeName: asNode({ type: "Identifier", name: "Promise" }),
						}),
					}),
				}),
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("promiseReturn");
	});
});
