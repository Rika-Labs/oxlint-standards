import { describe, expect, it } from "bun:test";
import { effectNoThrowInServicesRule } from "../../src/plugin/rules/effect-no-throw-in-services.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("effect-no-throw-in-services", () => {
	it("reports ThrowStatement in a file with effect imports", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = effectNoThrowInServicesRule.create(context);

		visitor.Program?.(
			asNode({
				type: "Program",
				body: [
					asNode({
						type: "ImportDeclaration",
						source: asNode({ type: "Literal", value: "effect" }),
						specifiers: [],
					}),
					asNode({
						type: "FunctionDeclaration",
						id: asNode({ type: "Identifier", name: "doWork" }),
						body: asNode({
							type: "BlockStatement",
							body: [
								asNode({
									type: "ThrowStatement",
									argument: asNode({
										type: "NewExpression",
										callee: asNode({ type: "Identifier", name: "Error" }),
										arguments: [asNode({ type: "Literal", value: "oops" })],
									}),
								}),
							],
						}),
					}),
				],
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("throwInService");
	});

	it("does not report ThrowStatement in a file without effect imports", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = effectNoThrowInServicesRule.create(context);

		visitor.Program?.(
			asNode({
				type: "Program",
				body: [
					asNode({
						type: "ImportDeclaration",
						source: asNode({ type: "Literal", value: "lodash" }),
						specifiers: [],
					}),
					asNode({
						type: "FunctionDeclaration",
						id: asNode({ type: "Identifier", name: "doWork" }),
						body: asNode({
							type: "BlockStatement",
							body: [
								asNode({
									type: "ThrowStatement",
									argument: asNode({
										type: "NewExpression",
										callee: asNode({ type: "Identifier", name: "Error" }),
										arguments: [asNode({ type: "Literal", value: "oops" })],
									}),
								}),
							],
						}),
					}),
				],
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
