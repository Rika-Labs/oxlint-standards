import { describe, expect, it } from "bun:test";
import { drizzleRequireInferTypesRule } from "../../src/plugin/rules/drizzle-require-infer-types.ts";
import {
	asNode,
	createTestContext,
	exportNamedDeclarationNode,
	identifierNode,
	importDeclarationNode,
	programNode,
} from "./helpers.ts";

describe("drizzle-require-infer-types", () => {
	it("reports manual exported interfaces in Drizzle files", () => {
		const { context, reports } = createTestContext("src/schema/user-schema.ts");
		const visitor = drizzleRequireInferTypesRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("drizzle-orm"),
				exportNamedDeclarationNode(
					asNode({
						type: "TSInterfaceDeclaration",
						id: identifierNode("User"),
						body: asNode({ type: "TSInterfaceBody", body: [] }),
					}),
				),
			]),
		);
		expect(reports).toHaveLength(1);
	});

	it("allows exported infer types", () => {
		const { context, reports } = createTestContext("src/schema/user-schema.ts");
		const visitor = drizzleRequireInferTypesRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("drizzle-orm"),
				exportNamedDeclarationNode(
					asNode({
						type: "TSTypeAliasDeclaration",
						id: identifierNode("User"),
						typeAnnotation: asNode({
							type: "TSTypeQuery",
							exprName: asNode({
								type: "TSQualifiedName",
								left: identifierNode("users"),
								right: identifierNode("$inferSelect"),
							}),
						}),
					}),
				),
			]),
		);
		expect(reports).toHaveLength(0);
	});

	it("ignores non-model helper exports", () => {
		const { context, reports } = createTestContext("src/schema/user-schema.ts");
		const visitor = drizzleRequireInferTypesRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("drizzle-orm"),
				exportNamedDeclarationNode(
					asNode({
						type: "TSTypeAliasDeclaration",
						id: identifierNode("UserFilter"),
						typeAnnotation: identifierNode("string"),
					}),
				),
			]),
		);
		expect(reports).toHaveLength(0);
	});
});
