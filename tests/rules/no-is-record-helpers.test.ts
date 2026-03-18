import { describe, expect, it } from "bun:test";
import { noIsRecordHelpersRule } from "../../src/plugin/rules/no-is-record-helpers.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-is-record-helpers", () => {
	it("reports function named isRecord", () => {
		const { context, reports } = createTestContext();
		const visitor = noIsRecordHelpersRule.create(context);
		visitor.FunctionDeclaration?.(
			asNode({
				type: "FunctionDeclaration",
				id: asNode({ type: "Identifier", name: "isRecord" }),
			}),
		);
		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("forbiddenName");
	});

	it("reports predicate value is Record<string, unknown>", () => {
		const { context, reports } = createTestContext();
		const visitor = noIsRecordHelpersRule.create(context);
		visitor.FunctionDeclaration?.(
			asNode({
				type: "FunctionDeclaration",
				id: asNode({ type: "Identifier", name: "checkInput" }),
				returnType: asNode({
					type: "TSTypeAnnotation",
					typeAnnotation: asNode({
						type: "TSTypePredicate",
						typeAnnotation: asNode({
							type: "TSTypeReference",
							typeName: asNode({ type: "Identifier", name: "Record" }),
							typeParameters: asNode({
								type: "TSTypeParameterInstantiation",
								params: [
									asNode({ type: "TSStringKeyword" }),
									asNode({ type: "TSUnknownKeyword" }),
								],
							}),
						}),
					}),
				}),
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("forbiddenPredicate");
	});

	it("reports calls to isRecord", () => {
		const { context, reports } = createTestContext();
		const visitor = noIsRecordHelpersRule.create(context);
		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({ type: "Identifier", name: "isRecord" }),
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("forbiddenCall");
	});
});
