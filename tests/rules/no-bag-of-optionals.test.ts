import { describe, expect, it } from "bun:test";
import { noBagOfOptionalsRule } from "../../src/plugin/rules/no-bag-of-optionals.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-bag-of-optionals", () => {
	it("reports exported type with 5+ optional fields and no discriminant", () => {
		const { context, reports } = createTestContext("src/types.ts");
		const visitor = noBagOfOptionalsRule.create(context);

		visitor.ExportNamedDeclaration?.(
			asNode({
				type: "ExportNamedDeclaration",
				declaration: asNode({
					type: "TSTypeAliasDeclaration",
					id: asNode({ type: "Identifier", name: "UserOptions" }),
					typeAnnotation: asNode({
						type: "TSTypeLiteral",
						members: [
							asNode({ type: "TSPropertySignature", key: asNode({ type: "Identifier", name: "name" }), optional: true }),
							asNode({ type: "TSPropertySignature", key: asNode({ type: "Identifier", name: "email" }), optional: true }),
							asNode({ type: "TSPropertySignature", key: asNode({ type: "Identifier", name: "age" }), optional: true }),
							asNode({ type: "TSPropertySignature", key: asNode({ type: "Identifier", name: "role" }), optional: true }),
							asNode({ type: "TSPropertySignature", key: asNode({ type: "Identifier", name: "avatar" }), optional: true }),
						],
					}),
				}),
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("bagOfOptionals");
	});

	it("allows exported type with 5+ optional fields when a discriminant is present", () => {
		const { context, reports } = createTestContext("src/types.ts");
		const visitor = noBagOfOptionalsRule.create(context);

		visitor.ExportNamedDeclaration?.(
			asNode({
				type: "ExportNamedDeclaration",
				declaration: asNode({
					type: "TSTypeAliasDeclaration",
					id: asNode({ type: "Identifier", name: "UserOptions" }),
					typeAnnotation: asNode({
						type: "TSTypeLiteral",
						members: [
							asNode({ type: "TSPropertySignature", key: asNode({ type: "Identifier", name: "_tag" }), optional: false }),
							asNode({ type: "TSPropertySignature", key: asNode({ type: "Identifier", name: "name" }), optional: true }),
							asNode({ type: "TSPropertySignature", key: asNode({ type: "Identifier", name: "email" }), optional: true }),
							asNode({ type: "TSPropertySignature", key: asNode({ type: "Identifier", name: "age" }), optional: true }),
							asNode({ type: "TSPropertySignature", key: asNode({ type: "Identifier", name: "role" }), optional: true }),
							asNode({ type: "TSPropertySignature", key: asNode({ type: "Identifier", name: "avatar" }), optional: true }),
						],
					}),
				}),
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
