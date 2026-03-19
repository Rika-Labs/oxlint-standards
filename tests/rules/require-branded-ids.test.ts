import { describe, expect, it } from "bun:test";
import { requireBrandedIdsRule } from "../../src/plugin/rules/require-branded-ids.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("require-branded-ids", () => {
	it("reports export type UserId = string (unbranded)", () => {
		const { context, reports } = createTestContext("src/types.ts");
		const visitor = requireBrandedIdsRule.create(context);

		visitor.ExportNamedDeclaration?.(
			asNode({
				type: "ExportNamedDeclaration",
				declaration: asNode({
					type: "TSTypeAliasDeclaration",
					id: asNode({ type: "Identifier", name: "UserId" }),
					typeAnnotation: asNode({
						type: "TSStringKeyword",
					}),
				}),
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("unbrandedId");
	});

	it("allows export type UserId = string & { _brand: 'UserId' }", () => {
		const { context, reports } = createTestContext("src/types.ts");
		const visitor = requireBrandedIdsRule.create(context);

		visitor.ExportNamedDeclaration?.(
			asNode({
				type: "ExportNamedDeclaration",
				declaration: asNode({
					type: "TSTypeAliasDeclaration",
					id: asNode({ type: "Identifier", name: "UserId" }),
					typeAnnotation: asNode({
						type: "TSIntersectionType",
						types: [
							asNode({ type: "TSStringKeyword" }),
							asNode({
								type: "TSTypeLiteral",
								members: [
									asNode({
										type: "TSPropertySignature",
										key: asNode({ type: "Identifier", name: "_brand" }),
										typeAnnotation: asNode({
											type: "TSTypeAnnotation",
											typeAnnotation: asNode({ type: "TSLiteralType", literal: asNode({ type: "Literal", value: "UserId" }) }),
										}),
									}),
								],
							}),
						],
					}),
				}),
			}),
		);

		expect(reports).toHaveLength(0);
	});

	it("does not report type names that do not end in Id", () => {
		const { context, reports } = createTestContext("src/types.ts");
		const visitor = requireBrandedIdsRule.create(context);

		visitor.ExportNamedDeclaration?.(
			asNode({
				type: "ExportNamedDeclaration",
				declaration: asNode({
					type: "TSTypeAliasDeclaration",
					id: asNode({ type: "Identifier", name: "UserName" }),
					typeAnnotation: asNode({
						type: "TSStringKeyword",
					}),
				}),
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
