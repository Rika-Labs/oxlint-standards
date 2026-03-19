import { describe, expect, it } from "bun:test";
import { noExportedAnyRule } from "../../src/plugin/rules/no-exported-any.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-exported-any", () => {
	it("reports ExportNamedDeclaration containing TSAnyKeyword in type annotation", () => {
		const { context, reports } = createTestContext("src/api.ts");
		const visitor = noExportedAnyRule.create(context);

		visitor.ExportNamedDeclaration?.(
			asNode({
				type: "ExportNamedDeclaration",
				declaration: asNode({
					type: "TSTypeAliasDeclaration",
					id: asNode({ type: "Identifier", name: "Payload" }),
					typeAnnotation: asNode({
						type: "TSAnyKeyword",
					}),
				}),
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("exportedAny");
	});

	it("allows ExportNamedDeclaration without any TSAnyKeyword", () => {
		const { context, reports } = createTestContext("src/api.ts");
		const visitor = noExportedAnyRule.create(context);

		visitor.ExportNamedDeclaration?.(
			asNode({
				type: "ExportNamedDeclaration",
				declaration: asNode({
					type: "TSTypeAliasDeclaration",
					id: asNode({ type: "Identifier", name: "Payload" }),
					typeAnnotation: asNode({
						type: "TSStringKeyword",
					}),
				}),
			}),
		);

		expect(reports).toHaveLength(0);
	});

	it("does not report for .generated.ts files", () => {
		const { context } = createTestContext("src/api.generated.ts");
		const visitor = noExportedAnyRule.create(context);

		// Visitor should be empty for generated files
		expect(visitor.ExportNamedDeclaration).toBeUndefined();
	});
});
