import { describe, expect, it } from "bun:test";
import { noInlineExportedObjectTypesRule } from "../../src/plugin/rules/no-inline-exported-object-types.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-inline-exported-object-types", () => {
	it("reports ExportNamedDeclaration with TSTypeLiteral having 4+ members", () => {
		const { context, reports } = createTestContext("src/api.ts");
		const visitor = noInlineExportedObjectTypesRule.create(context);

		visitor.ExportNamedDeclaration?.(
			asNode({
				type: "ExportNamedDeclaration",
				declaration: asNode({
					type: "FunctionDeclaration",
					id: asNode({ type: "Identifier", name: "createUser" }),
					params: [
						asNode({
							type: "Identifier",
							name: "input",
							typeAnnotation: asNode({
								type: "TSTypeAnnotation",
								typeAnnotation: asNode({
									type: "TSTypeLiteral",
									members: [
										asNode({ type: "TSPropertySignature", key: asNode({ type: "Identifier", name: "name" }) }),
										asNode({ type: "TSPropertySignature", key: asNode({ type: "Identifier", name: "email" }) }),
										asNode({ type: "TSPropertySignature", key: asNode({ type: "Identifier", name: "age" }) }),
										asNode({ type: "TSPropertySignature", key: asNode({ type: "Identifier", name: "role" }) }),
									],
								}),
							}),
						}),
					],
				}),
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("inlineObjectType");
	});

	it("allows ExportNamedDeclaration with TSTypeLiteral having fewer than 4 members", () => {
		const { context, reports } = createTestContext("src/api.ts");
		const visitor = noInlineExportedObjectTypesRule.create(context);

		visitor.ExportNamedDeclaration?.(
			asNode({
				type: "ExportNamedDeclaration",
				declaration: asNode({
					type: "FunctionDeclaration",
					id: asNode({ type: "Identifier", name: "createUser" }),
					params: [
						asNode({
							type: "Identifier",
							name: "input",
							typeAnnotation: asNode({
								type: "TSTypeAnnotation",
								typeAnnotation: asNode({
									type: "TSTypeLiteral",
									members: [
										asNode({ type: "TSPropertySignature", key: asNode({ type: "Identifier", name: "name" }) }),
										asNode({ type: "TSPropertySignature", key: asNode({ type: "Identifier", name: "email" }) }),
									],
								}),
							}),
						}),
					],
				}),
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
